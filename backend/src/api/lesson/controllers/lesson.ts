/**
 * Lesson Controller
 * Handles lesson structuring, ordered sequence retrieval, and instructor ownership verification.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
  async find(ctx) {
    ctx.query = {
      ...ctx.query,
      populate: {
        course: {
          fields: ['id', 'title', 'category'],
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
          fields: ['id', 'title', 'category'],
          populate: ['instructor', 'co_instructors'],
        },
        ...(typeof ctx.query.populate === 'object' ? ctx.query.populate : {}),
      },
    };

    return super.findOne(ctx);
  },

  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to create a lesson.');
    }

    if (!['admin', 'content_manager', 'instructor'].includes(user.role_type)) {
      return ctx.forbidden('Your role is not permitted to create lessons.');
    }

    // If instructor, verify that the course belongs to this instructor
    if (user.role_type === 'instructor') {
      const courseId = ctx.request.body?.data?.course;

      if (!courseId) {
        return ctx.badRequest('A valid course relation is required to create a lesson.');
      }

      // Check course ownership
      const course = typeof courseId === 'string'
        ? await strapi.documents('api::course.course').findOne({
            documentId: courseId,
            populate: ['instructor', 'co_instructors'],
          })
        : await strapi.db.query('api::course.course').findOne({
            where: { id: courseId },
            populate: ['instructor', 'co_instructors'],
          });

      if (!course) {
        return ctx.notFound('Parent course not found.');
      }

      const instructorId = (course.instructor as any)?.id;
      const instructorDocId = (course.instructor as any)?.documentId;

      const isLeadOwner = (instructorId && instructorId === user.id) ||
                          (instructorDocId && instructorDocId === user.documentId);
      const isCoInstructor = ((course as any)?.co_instructors || [])?.some(
        (ci: any) => ci.id === user.id || ci.documentId === user.documentId
      );

      if (!isLeadOwner && !isCoInstructor) {
        return ctx.forbidden('Access denied: You can only add lessons to your own courses.');
      }
    }

    return super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    if (!user) {
      return ctx.unauthorized('You must be logged in to update a lesson.');
    }

    if (!['admin', 'content_manager', 'instructor'].includes(user.role_type)) {
      return ctx.forbidden('Your role is not permitted to update lessons.');
    }

    // If instructor, verify ownership of the lesson's parent course
    if (user.role_type === 'instructor') {
      const lesson = await strapi.documents('api::lesson.lesson').findOne({
        documentId: id,
        populate: {
          course: {
            populate: ['instructor', 'co_instructors'],
          },
        },
      });

      if (!lesson) {
        return ctx.notFound('Lesson not found.');
      }

      const instructorId = (lesson as any).course?.instructor?.id;
      const instructorDocId = (lesson as any).course?.instructor?.documentId;

      const isLeadOwner = (instructorId && instructorId === user.id) ||
                          (instructorDocId && instructorDocId === user.documentId);
      const isCoInstructor = ((lesson as any)?.course?.co_instructors || [])?.some(
        (ci: any) => ci.id === user.id || ci.documentId === user.documentId
      );

      if (!isLeadOwner && !isCoInstructor) {
        return ctx.forbidden('Access denied: You can only edit lessons from your own courses.');
      }
    }

    return super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    if (!user) {
      return ctx.unauthorized('You must be logged in to delete a lesson.');
    }

    if (!['admin', 'content_manager', 'instructor'].includes(user.role_type)) {
      return ctx.forbidden('Your role is not permitted to delete lessons.');
    }

    // If instructor, verify ownership of the lesson's parent course
    if (user.role_type === 'instructor') {
      const lesson = await strapi.documents('api::lesson.lesson').findOne({
        documentId: id,
        populate: {
          course: {
            populate: ['instructor', 'co_instructors'],
          },
        },
      });

      if (!lesson) {
        return ctx.notFound('Lesson not found.');
      }

      const instructorId = (lesson as any).course?.instructor?.id;
      const instructorDocId = (lesson as any).course?.instructor?.documentId;

      const isLeadOwner = (instructorId && instructorId === user.id) ||
                          (instructorDocId && instructorDocId === user.documentId);
      const isCoInstructor = ((lesson as any)?.course?.co_instructors || [])?.some(
        (ci: any) => ci.id === user.id || ci.documentId === user.documentId
      );

      if (!isLeadOwner && !isCoInstructor) {
        return ctx.forbidden('Access denied: You can only delete lessons from your own courses.');
      }
    }

    return super.delete(ctx);
  },
}));
