/**
 * Quiz & Server-Side Auto-Grading Controller
 * 
 * Line-by-Line Grading Logic for Video Walkthrough:
 * 1. Client Submits Answers: The student client sends ONLY a map of selected option indices (e.g. { "0": 2, "1": 0 }).
 * 2. Server-Side Ground Truth: The backend retrieves the authentic Quiz record from the database containing correct_option_index.
 *    Client-supplied scores are NEVER trusted.
 * 3. Question Evaluation Loop:
 *    - Each question is checked: isCorrect = (submittedAnswerIndex === question.correct_option_index)
 *    - Correct answers are tallied: correctCount += 1
 * 4. Percentage & Pass Determination:
 *    - score = Math.round((correctCount / totalQuestions) * 100)
 *    - passed = score >= (quiz.passing_score || 70)
 * 5. Persistence:
 *    - A QuizSubmission entity is saved to the database linking student, quiz, score, passed, and answers.
 * 6. Scoped Authoring:
 *    - Admin / Content Manager can manage quizzes for any course.
 *    - Instructors can only create, update, or delete quizzes belonging to their own courses.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz.quiz', ({ strapi }) => ({
  async find(ctx) {
    ctx.query = {
      ...ctx.query,
      populate: {
        course: {
          populate: ['instructor'],
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
          populate: ['instructor'],
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
          populate: ['instructor'],
        })
      : await strapi.db.query('api::course.course').findOne({
          where: { id: courseInput },
          populate: ['instructor'],
        });

    if (!targetCourse) {
      return ctx.notFound('Course not found.');
    }

    // Instructor ownership check
    if (user.role_type === 'instructor') {
      const instrId = (targetCourse.instructor as any)?.id;
      const instrDocId = (targetCourse.instructor as any)?.documentId;
      const isOwner = (instrId && instrId === user.id) || (instrDocId && instrDocId === user.documentId);

      if (!isOwner) {
        return ctx.forbidden('Access denied: Instructors can only add quizzes to their own courses.');
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

    const { answers } = ctx.request.body?.data || {};
    if (!answers || typeof answers !== 'object') {
      return ctx.badRequest('A valid answers map/object is required for quiz evaluation.');
    }

    // Retrieve authentic Quiz record from database
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

    // Persist QuizSubmission record
    const submission = await strapi.documents('api::quiz-submission.quiz-submission').create({
      data: {
        student: userDocId,
        quiz: quizDocId,
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
