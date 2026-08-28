/**
 * Progress Controller
 * Manages lesson completion toggling and real-time course progress percentage tracking.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::progress.progress', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to view progress.');
    }

    ctx.query = {
      ...ctx.query,
      populate: {
        lesson: {
          fields: ['id', 'title', 'order'],
        },
        course: {
          fields: ['id', 'title'],
        },
        student: {
          fields: ['id', 'username', 'email'],
        },
        ...(typeof ctx.query.populate === 'object' ? ctx.query.populate : {}),
      },
    };

    // Scoped strictly for students
    if (user.role_type === 'student') {
      ctx.query.filters = {
        ...(typeof ctx.query.filters === 'object' ? ctx.query.filters : {}),
        student: {
          id: {
            $eq: user.id,
          },
        },
      };
    }

    // If Instructor, strictly scope to progress records for own courses
    if (user.role_type === 'instructor') {
      ctx.query.filters = {
        ...(typeof ctx.query.filters === 'object' ? ctx.query.filters : {}),
        course: {
          instructor: {
            id: {
              $eq: user.id,
            },
          },
        },
      };
    }

    return super.find(ctx);
  },

  async toggleLesson(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to update lesson progress.');
    }

    const { lessonId, courseId } = ctx.request.body?.data || {};

    if (!lessonId || !courseId) {
      return ctx.badRequest('Both lessonId and courseId are required.');
    }

    // Resolve Lesson by documentId or numeric id
    const targetLesson = typeof lessonId === 'string'
      ? await strapi.documents('api::lesson.lesson').findOne({ documentId: lessonId })
      : await strapi.db.query('api::lesson.lesson').findOne({ where: { id: lessonId } });

    if (!targetLesson) {
      return ctx.notFound('Lesson not found.');
    }

    // Resolve Course by documentId or numeric id
    const targetCourse = typeof courseId === 'string'
      ? await strapi.documents('api::course.course').findOne({
          documentId: courseId,
          populate: ['lessons'],
        })
      : await strapi.db.query('api::course.course').findOne({
          where: { id: courseId },
          populate: ['lessons'],
        });

    if (!targetCourse) {
      return ctx.notFound('Course not found.');
    }

    const userEntry = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      select: ['id', 'documentId'],
    });

    const userDocId = userEntry?.documentId || user.documentId;
    const lessonDocId = targetLesson.documentId;
    const courseDocId = targetCourse.documentId;

    // Check if progress record already exists for this student & lesson
    const existingProgress = await strapi.db.query('api::progress.progress').findOne({
      where: {
        student: user.id,
        lesson: targetLesson.id,
      },
    });

    let isCompleted = false;

    if (existingProgress) {
      // Toggle OFF: Delete existing progress record
      await strapi.documents('api::progress.progress').delete({
        documentId: existingProgress.documentId,
      });
      isCompleted = false;
    } else {
      // Toggle ON: Create new progress record
      await strapi.documents('api::progress.progress').create({
        data: {
          student: userDocId,
          lesson: lessonDocId,
          course: courseDocId,
          completed_at: new Date().toISOString(),
        },
      });
      isCompleted = true;
    }

    // Compute updated course progress
    const totalLessons = targetCourse.lessons?.length || 0;
    
    // Fetch all completed lessons for this student in this course
    const allStudentProgress = await strapi.documents('api::progress.progress').findMany({
      filters: {
        student: { id: { $eq: user.id } },
        course: { id: { $eq: targetCourse.id } },
      },
      populate: ['lesson'],
    });

    const completedLessons = allStudentProgress.length;
    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const completedLessonIds = allStudentProgress
      .map((p) => (p.lesson as any)?.documentId)
      .filter(Boolean);

    return ctx.send({
      data: {
        lessonId: lessonDocId,
        isCompleted,
        courseId: courseDocId,
        totalLessons,
        completedLessons,
        percentage,
        completedLessonIds,
      },
    });
  },

  async getCourseProgress(ctx) {
    const user = ctx.state.user;
    const { courseId } = ctx.params;

    if (!user) {
      return ctx.unauthorized('You must be logged in to view course progress.');
    }

    // Resolve course
    const targetCourse = typeof courseId === 'string'
      ? await strapi.documents('api::course.course').findOne({
          documentId: courseId,
          populate: ['lessons'],
        })
      : await strapi.db.query('api::course.course').findOne({
          where: { id: courseId },
          populate: ['lessons'],
        });

    if (!targetCourse) {
      return ctx.notFound('Course not found.');
    }

    const totalLessons = targetCourse.lessons?.length || 0;

    // Fetch all progress entries for this student & course
    const allProgress = await strapi.documents('api::progress.progress').findMany({
      filters: {
        student: { id: { $eq: user.id } },
        course: { id: { $eq: targetCourse.id } },
      },
      populate: ['lesson'],
    });

    const completedLessons = allProgress.length;
    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const completedLessonIds = allProgress
      .map((p) => (p.lesson as any)?.documentId)
      .filter(Boolean);

    return ctx.send({
      data: {
        courseId: targetCourse.documentId,
        totalLessons,
        completedLessons,
        percentage,
        completedLessonIds,
      },
    });
  },
}));
