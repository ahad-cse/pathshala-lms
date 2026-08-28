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
          fields: ['id', 'documentId', 'title', 'order'],
        },
        course: {
          fields: ['id', 'documentId', 'title'],
        },
        student: {
          fields: ['id', 'documentId', 'username', 'email'],
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
    const targetLesson = await strapi.db.query('api::lesson.lesson').findOne({
      where: {
        $or: [
          ...(typeof lessonId === 'string' ? [{ documentId: lessonId }] : []),
          ...(!isNaN(Number(lessonId)) ? [{ id: Number(lessonId) }] : []),
        ],
      },
    });

    if (!targetLesson) {
      return ctx.notFound('Lesson not found.');
    }

    // Resolve Course by documentId or numeric id
    const targetCourse = await strapi.db.query('api::course.course').findOne({
      where: {
        $or: [
          ...(typeof courseId === 'string' ? [{ documentId: courseId }] : []),
          ...(!isNaN(Number(courseId)) ? [{ id: Number(courseId) }] : []),
        ],
      },
      populate: ['lessons'],
    });

    if (!targetCourse) {
      return ctx.notFound('Course not found.');
    }

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
      await strapi.db.query('api::progress.progress').delete({
        where: { id: existingProgress.id },
      });
      isCompleted = false;
    } else {
      // Toggle ON: Create new progress record
      await strapi.db.query('api::progress.progress').create({
        data: {
          student: user.id,
          lesson: targetLesson.id,
          course: targetCourse.id,
          completed_at: new Date().toISOString(),
        },
      });
      isCompleted = true;
    }

    // Compute updated course progress
    const allCourseLessons = await strapi.db.query('api::lesson.lesson').findMany({
      where: { course: targetCourse.id },
    });
    const totalLessons = allCourseLessons.length;
    
    // Fetch all completed lessons for this student in this course
    const allStudentProgress = await strapi.db.query('api::progress.progress').findMany({
      where: {
        student: user.id,
        course: targetCourse.id,
      },
      populate: ['lesson'],
    });

    const completedLessons = allStudentProgress.length;
    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const completedLessonIds = allStudentProgress
      .map((p: any) => p.lesson?.documentId || String(p.lesson?.id))
      .filter(Boolean);

    return ctx.send({
      data: {
        lessonId: targetLesson.documentId || String(targetLesson.id),
        isCompleted,
        courseId: targetCourse.documentId || String(targetCourse.id),
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
    const targetCourse = await strapi.db.query('api::course.course').findOne({
      where: {
        $or: [
          ...(typeof courseId === 'string' ? [{ documentId: courseId }] : []),
          ...(!isNaN(Number(courseId)) ? [{ id: Number(courseId) }] : []),
        ],
      },
      populate: ['lessons'],
    });

    if (!targetCourse) {
      return ctx.notFound('Course not found.');
    }

    const allCourseLessons = await strapi.db.query('api::lesson.lesson').findMany({
      where: { course: targetCourse.id },
    });
    const totalLessons = allCourseLessons.length;

    // Fetch all progress entries for this student & course
    const allProgress = await strapi.db.query('api::progress.progress').findMany({
      where: {
        student: user.id,
        course: targetCourse.id,
      },
      populate: ['lesson'],
    });

    const completedLessons = allProgress.length;
    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const completedLessonIds = allProgress
      .map((p: any) => p.lesson?.documentId || String(p.lesson?.id))
      .filter(Boolean);

    return ctx.send({
      data: {
        courseId: targetCourse.documentId || String(targetCourse.id),
        totalLessons,
        completedLessons,
        percentage,
        completedLessonIds,
      },
    });
  },
}));
