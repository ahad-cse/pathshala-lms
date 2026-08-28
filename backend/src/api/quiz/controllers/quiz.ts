/**
 * Quiz Controller
 * Handles quiz retrieval, scoped instructor authoring, and server-side auto-grading.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz.quiz', ({ strapi }) => ({
  async find(ctx) {
    ctx.query = {
      ...ctx.query,
      populate: {
        course: {
          populate: ['instructor', 'co_instructors'],
        },
        ...(typeof ctx.query.populate === 'object' ? ctx.query.populate : {}),
      },
    };

    return super.find(ctx);
  },

  async findOne(ctx) {
    ctx.query = {
      ...ctx.query,
      populate: {
        course: {
          populate: ['instructor', 'co_instructors'],
        },
        ...(typeof ctx.query.populate === 'object' ? ctx.query.populate : {}),
      },
    };

    return super.findOne(ctx);
  },

  async getByCourse(ctx) {
    const { courseId } = ctx.params;

    // Resolve course
    const targetCourse = typeof courseId === 'string'
      ? await strapi.documents('api::course.course').findOne({ documentId: courseId })
      : await strapi.db.query('api::course.course').findOne({ where: { id: courseId } });

    if (!targetCourse) {
      return ctx.notFound('Course not found.');
    }

    const quizzes = await strapi.documents('api::quiz.quiz').findMany({
      filters: {
        course: { id: { $eq: targetCourse.id } },
      },
      populate: ['course'],
    });

    return ctx.send({ data: quizzes });
  },

  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to create a quiz.');
    }

    if (user.role_type === 'student') {
      return ctx.forbidden('Students cannot author quizzes.');
    }

    const { title, description, passing_score, questions, course: courseInput } = ctx.request.body?.data || {};

    if (!title || !courseInput || !questions || !Array.isArray(questions)) {
      return ctx.badRequest('Title, course, and a valid questions array are required.');
    }

    // Resolve target course
    const targetCourse = typeof courseInput === 'string'
      ? await strapi.documents('api::course.course').findOne({
          documentId: courseInput,
          populate: ['instructor', 'co_instructors'],
        })
      : await strapi.db.query('api::course.course').findOne({
          where: { id: courseInput },
          populate: ['instructor', 'co_instructors'],
        });

    if (!targetCourse) {
      return ctx.notFound('Course not found.');
    }

    // Instructor ownership check (Lead or Co-Instructor)
    if (user.role_type === 'instructor') {
      const instrId = (targetCourse.instructor as any)?.id;
      const instrDocId = (targetCourse.instructor as any)?.documentId;
      const isLeadOwner = (instrId && instrId === user.id) || (instrDocId && instrDocId === user.documentId);
      const isCoInstructor = ((targetCourse as any)?.co_instructors as any[])?.some(
        (ci) => ci.id === user.id || ci.documentId === user.documentId
      );

      if (!isLeadOwner && !isCoInstructor) {
        return ctx.forbidden('Access denied: Instructors can only add quizzes to courses they are assigned to.');
      }
    }

    const newQuiz = await strapi.documents('api::quiz.quiz').create({
      data: {
        title,
        description: description || '',
        passing_score: passing_score || 70,
        questions,
        course: targetCourse.documentId,
      },
      populate: ['course'],
    });

    return ctx.created({ data: newQuiz });
  },

  async update(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    if (!user) {
      return ctx.unauthorized('You must be logged in to update a quiz.');
    }

    if (user.role_type === 'student') {
      return ctx.forbidden('Students cannot author or update quizzes.');
    }

    // Resolve quiz
    const targetQuiz = typeof id === 'string'
      ? await strapi.documents('api::quiz.quiz').findOne({
          documentId: id,
          populate: ['course.instructor', 'course.co_instructors'],
        })
      : await strapi.db.query('api::quiz.quiz').findOne({
          where: { id },
          populate: ['course.instructor', 'course.co_instructors'],
        });

    if (!targetQuiz) {
      return ctx.notFound('Quiz not found.');
    }

    // Instructor ownership check
    if (user.role_type === 'instructor') {
      const instrId = (targetQuiz.course?.instructor as any)?.id;
      const instrDocId = (targetQuiz.course?.instructor as any)?.documentId;
      const isOwner = (instrId && instrId === user.id) || (instrDocId && instrDocId === user.documentId);

      if (!isOwner) {
        return ctx.forbidden('Access denied: Instructors can only update quizzes for their own courses.');
      }
    }

    const { title, description, passing_score, questions, course: courseInput } = ctx.request.body?.data || {};

    const updatedData: any = {};
    if (title) updatedData.title = title;
    if (description !== undefined) updatedData.description = description;
    if (passing_score !== undefined) updatedData.passing_score = Number(passing_score);
    if (questions && Array.isArray(questions)) updatedData.questions = questions;
    if (courseInput) {
      const resolvedCourse = typeof courseInput === 'string'
        ? await strapi.documents('api::course.course').findOne({ documentId: courseInput })
        : await strapi.db.query('api::course.course').findOne({ where: { id: courseInput } });
      if (resolvedCourse) {
        updatedData.course = resolvedCourse.documentId;
      }
    }

    const updatedQuiz = await strapi.documents('api::quiz.quiz').update({
      documentId: targetQuiz.documentId,
      data: updatedData,
      populate: ['course'],
    });

    return ctx.send({ data: updatedQuiz });
  },

  async submitQuiz(ctx) {
    const user = ctx.state.user;
    const { quizId } = ctx.params;

    if (!user) {
      return ctx.unauthorized('You must be logged in to take and submit a quiz.');
    }

    // Strictly enforce Permission Matrix: "Take quizzes" is Student ONLY
    if (user.role_type !== 'student') {
      return ctx.forbidden('Access denied: Only students are permitted to take and submit quizzes per the Permission Matrix.');
    }

    // Retrieve authentic Quiz record from database with parent course
    const quiz = typeof quizId === 'string'
      ? await strapi.documents('api::quiz.quiz').findOne({
          documentId: quizId,
          populate: ['course'],
        })
      : await strapi.db.query('api::quiz.quiz').findOne({
          where: { id: quizId },
          populate: ['course'],
        });

    if (!quiz) {
      return ctx.notFound('Quiz not found.');
    }

    // Verify that the student is actively enrolled in this course
    const courseDocId = (quiz.course as any)?.documentId;
    let targetCourseId = (quiz.course as any)?.id;

    if (!targetCourseId && courseDocId) {
      const courseRecord = await strapi.db.query('api::course.course').findOne({
        where: { documentId: courseDocId },
        select: ['id'],
      });
      targetCourseId = courseRecord?.id;
    }

    const enrollment = targetCourseId ? await strapi.db.query('api::enrollment.enrollment').findOne({
      where: {
        student: user.id,
        course: targetCourseId,
      },
    }) : null;

    if (!enrollment) {
      return ctx.forbidden('Access denied: You must be actively enrolled in this course to take its assessment quizzes.');
    }

    const { answers } = ctx.request.body?.data || {};
    if (!answers || typeof answers !== 'object') {
      return ctx.badRequest('A valid answers map/object is required for quiz evaluation.');
    }



    const questions: any[] = Array.isArray(quiz.questions) ? quiz.questions : [];
    const totalQuestions = questions.length;

    if (totalQuestions === 0) {
      return ctx.badRequest('This quiz does not contain any questions.');
    }

    // Server-Side Auto-Grading Engine
    let correctCount = 0;
    const breakdown = questions.map((q, idx) => {
      const submittedAnswer = answers[idx] !== undefined ? Number(answers[idx]) : null;
      const correctAnswer = Number(q.correct_option_index);
      const isCorrect = submittedAnswer !== null && submittedAnswer === correctAnswer;

      if (isCorrect) {
        correctCount += 1;
      }

      return {
        questionIndex: idx,
        question: q.question,
        options: q.options,
        submittedAnswer,
        correctAnswer,
        isCorrect,
        explanation: q.explanation || '',
      };
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passingScore = quiz.passing_score || 70;
    const passed = score >= passingScore;

    // Resolve user documentId
    const userEntry = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      select: ['id', 'documentId'],
    });

    const userDocId = userEntry?.documentId || user.documentId;
    const quizDocId = quiz.documentId;

    // Persist QuizSubmission record via db.query
    const submission = await strapi.db.query('api::quiz-submission.quiz-submission').create({
      data: {
        student: user.id,
        quiz: quiz.id,
        score,
        passed,
        answers,
        submitted_at: new Date().toISOString(),
      },
    });

    return ctx.send({
      data: {
        submissionId: submission.documentId,
        quizId: quizDocId,
        quizTitle: quiz.title,
        score,
        passingScore,
        passed,
        totalQuestions,
        correctCount,
        breakdown,
        submittedAt: new Date().toISOString(),
      },
    });
  },
}));
