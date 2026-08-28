/**
 * Enrollment Controller
 * Handles student course enrollments, duplicate prevention, and enrollment records retrieval.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::enrollment.enrollment', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to view enrollments.');
    }

    // Configure deep population for course details & lessons
    ctx.query = {
      ...ctx.query,
      populate: {
        course: {
          populate: {
            instructor: {
              fields: ['id', 'username', 'email'],
            },
            lessons: {
              fields: ['id', 'title', 'order', 'video_url'],
              sort: { order: 'asc' },
            },
          },
        },
        student: {
          fields: ['id', 'username', 'email', 'role_type'],
        },
        ...(typeof ctx.query.populate === 'object' ? ctx.query.populate : {}),
      },
    };

    // If Student, strictly scope query to own enrollments
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

    // If Instructor, strictly scope to enrollments for own authored courses
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

  async findOne(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    if (!user) {
      return ctx.unauthorized('You must be logged in to view an enrollment.');
    }

    ctx.query = {
      ...ctx.query,
      populate: {
        course: {
          populate: {
            instructor: {
              fields: ['id', 'username', 'email'],
            },
            lessons: {
              fields: ['id', 'title', 'order', 'video_url', 'content'],
              sort: { order: 'asc' },
            },
          },
        },
        student: {
          fields: ['id', 'username', 'email', 'role_type'],
        },
        ...(typeof ctx.query.populate === 'object' ? ctx.query.populate : {}),
      },
    };

    const enrollment = await strapi.documents('api::enrollment.enrollment').findOne({
      documentId: id,
      populate: ['student'],
    });

    if (!enrollment) {
      return ctx.notFound('Enrollment not found.');
    }

    if (user.role_type === 'student') {
      const studentId = (enrollment.student as any)?.id;
      const studentDocId = (enrollment.student as any)?.documentId;
      const isOwner = (studentId && studentId === user.id) || (studentDocId && studentDocId === user.documentId);

      if (!isOwner) {
        return ctx.forbidden('Access denied: You can only view your own course enrollments.');
      }
    }

    return super.findOne(ctx);
  },

  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to enroll in a course.');
    }

    if (user.role_type !== 'student') {
      return ctx.forbidden('Only students can enroll in courses.');
    }

    const courseInput = ctx.request.body?.data?.course;
    if (!courseInput) {
      return ctx.badRequest('A valid course relation is required for enrollment.');
    }

    // Resolve course by documentId or numeric id
    const targetCourse = await strapi.db.query('api::course.course').findOne({
      where: {
        $or: [
          ...(typeof courseInput === 'string' ? [{ documentId: courseInput }] : []),
          ...(!isNaN(Number(courseInput)) ? [{ id: Number(courseInput) }] : []),
        ],
      },
    });

    if (!targetCourse) {
      return ctx.notFound('Course not found.');
    }

    // Check for existing enrollment to prevent duplicates
    const existingEnrollment = await strapi.db.query('api::enrollment.enrollment').findOne({
      where: {
        student: user.id,
        course: targetCourse.id,
      },
      populate: ['course', 'student'],
    });

    if (existingEnrollment) {
      return ctx.send({ data: existingEnrollment, meta: { message: 'Already enrolled in this course.' } });
    }

    // Create new enrollment via db.query to guarantee flawless relation resolution
    const newEnrollment = await strapi.db.query('api::enrollment.enrollment').create({
      data: {
        student: user.id,
        course: targetCourse.id,
        enrolled_at: new Date().toISOString(),
      },
      populate: ['course', 'student'],
    });

    return ctx.created({ data: newEnrollment });
  },
}));
