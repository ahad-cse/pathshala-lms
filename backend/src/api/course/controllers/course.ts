/**
 * Course Controller
 * Handles course catalog querying, nested relation populates, and instructor ownership permissions.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::course.course', ({ strapi }) => ({
  async find(ctx) {
    // Populate instructor and lessons for course lists
    ctx.query = {
      ...ctx.query,
      populate: {
        instructor: {
          fields: ['id', 'username', 'email', 'role_type'],
        },
        lessons: {
          fields: ['id', 'title', 'order', 'video_url'],
          sort: { order: 'asc' },
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
        instructor: {
          fields: ['id', 'username', 'email', 'role_type'],
        },
        lessons: {
          fields: ['id', 'title', 'order', 'video_url', 'content'],
          sort: { order: 'asc' },
        },
        ...(typeof ctx.query.populate === 'object' ? ctx.query.populate : {}),
      },
    };

    return super.findOne(ctx);
  },

  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to create a course.');
    }

    if (!['admin', 'content_manager', 'instructor'].includes(user.role_type)) {
      return ctx.forbidden('Your role is not permitted to create courses.');
    }

    // Get user documentId for Strapi v5 relation binding
    const userEntry = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      select: ['id', 'documentId'],
    });

    const userDocId = userEntry?.documentId || user.documentId;

    // If role is instructor, force instructor to be the logged-in user
    if (user.role_type === 'instructor') {
      ctx.request.body.data = {
        ...ctx.request.body.data,
        instructor: userDocId,
      };
    } else if (user.role_type === 'admin' || user.role_type === 'content_manager') {
      // If no instructor provided, default to creator
      if (!ctx.request.body.data.instructor) {
        ctx.request.body.data.instructor = userDocId;
      }
    }

    return super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    if (!user) {
      return ctx.unauthorized('You must be logged in to update a course.');
    }

    if (!['admin', 'content_manager', 'instructor'].includes(user.role_type)) {
      return ctx.forbidden('Your role is not permitted to update courses.');
    }

    // Instructors can ONLY edit their own courses
    if (user.role_type === 'instructor') {
      const course = await strapi.documents('api::course.course').findOne({
        documentId: id,
        populate: ['instructor'],
      });

      if (!course) {
        return ctx.notFound('Course not found.');
      }

      const courseInstructorId = (course.instructor as any)?.id;
      const courseInstructorDocId = (course.instructor as any)?.documentId;

      const isOwner =
        (courseInstructorId && courseInstructorId === user.id) ||
        (courseInstructorDocId && courseInstructorDocId === user.documentId);

      if (!isOwner) {
        return ctx.forbidden('Access denied: You can only edit your own courses.');
      }
    }

    return super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    if (!user) {
      return ctx.unauthorized('You must be logged in to delete a course.');
    }

    if (!['admin', 'content_manager', 'instructor'].includes(user.role_type)) {
      return ctx.forbidden('Your role is not permitted to delete courses.');
    }

    // Instructors can ONLY delete their own courses
    if (user.role_type === 'instructor') {
      const course = await strapi.documents('api::course.course').findOne({
        documentId: id,
        populate: ['instructor'],
      });

      if (!course) {
        return ctx.notFound('Course not found.');
      }

      const courseInstructorId = (course.instructor as any)?.id;
      const courseInstructorDocId = (course.instructor as any)?.documentId;

      const isOwner =
        (courseInstructorId && courseInstructorId === user.id) ||
        (courseInstructorDocId && courseInstructorDocId === user.documentId);

      if (!isOwner) {
        return ctx.forbidden('Access denied: You can only delete your own courses.');
      }
    }

    return super.delete(ctx);
  },
}));
