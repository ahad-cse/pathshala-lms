/**
 * Admin Dashboard Controller
 * Provides aggregate platform statistics and user role management endpoints.
 */

import { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async getStats(ctx: any) {
    const user = ctx.state.user;

    if (!user || user.role_type !== 'admin') {
      return ctx.forbidden('Access denied: Admin privileges required.');
    }

    try {
      // 1. Users Breakdown
      const allUsers = await strapi.db.query('plugin::users-permissions.user').findMany({
        select: ['id', 'role_type'],
      });

      const usersByRole = {
        admin: 0,
        content_manager: 0,
        instructor: 0,
        student: 0,
      };

      allUsers.forEach((u: any) => {
        const r = u.role_type as keyof typeof usersByRole;
        if (usersByRole[r] !== undefined) {
          usersByRole[r] += 1;
        }
      });

      // 2. Platform Content Counts
      const totalCourses = await strapi.db.query('api::course.course').count();
      const totalLessons = await strapi.db.query('api::lesson.lesson').count();
      const totalEnrollments = await strapi.db.query('api::enrollment.enrollment').count();
      const totalQuizzes = await strapi.db.query('api::quiz.quiz').count();
      const totalSubmissions = await strapi.db.query('api::quiz-submission.quiz-submission').count();

      return ctx.send({
        data: {
          totalUsers: allUsers.length,
          usersByRole,
          totalCourses,
          totalLessons,
          totalEnrollments,
          totalQuizzes,
          totalSubmissions,
        },
      });
    } catch (err: any) {
      strapi.log.error('[ADMIN] Error fetching platform statistics:', err);
      return ctx.internalServerError('Failed to fetch platform metrics.');
    }
  },

  async getUsers(ctx: any) {
    const user = ctx.state.user;

    if (!user || user.role_type !== 'admin') {
      return ctx.forbidden('Access denied: Admin privileges required.');
    }

    try {
      const users = await strapi.db.query('plugin::users-permissions.user').findMany({
        select: ['id', 'documentId', 'username', 'email', 'role_type', 'createdAt', 'confirmed', 'blocked'],
        orderBy: { createdAt: 'desc' },
      });

      return ctx.send({ data: users });
    } catch (err: any) {
      strapi.log.error('[ADMIN] Error fetching user directory:', err);
      return ctx.internalServerError('Failed to fetch user list.');
    }
  },

  async updateUserRole(ctx: any) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    const { role_type } = ctx.request.body || {};

    if (!user || user.role_type !== 'admin') {
      return ctx.forbidden('Access denied: Admin privileges required.');
    }

    const validRoles = ['admin', 'content_manager', 'instructor', 'student'];
    if (!role_type || !validRoles.includes(role_type)) {
      return ctx.badRequest(`Invalid role_type. Must be one of: ${validRoles.join(', ')}`);
    }

    // Resolve target user
    const targetUser = typeof id === 'string' && id.length > 10
      ? await strapi.db.query('plugin::users-permissions.user').findOne({ where: { documentId: id } })
      : await strapi.db.query('plugin::users-permissions.user').findOne({ where: { id: Number(id) } });

    if (!targetUser) {
      return ctx.notFound('User not found.');
    }

    // Prevent active admin from demoting self to avoid lockout
    if (targetUser.id === user.id && role_type !== 'admin') {
      return ctx.badRequest('You cannot demote your own active admin account.');
    }

    const updatedUser = await strapi.db.query('plugin::users-permissions.user').update({
      where: { id: targetUser.id },
      data: { role_type },
      select: ['id', 'documentId', 'username', 'email', 'role_type', 'updatedAt'],
    });

    strapi.log.info(`[ADMIN] Admin "${user.username}" updated user "${targetUser.username}" role to "${role_type}"`);

    return ctx.send({ data: updatedUser });
  },

  async deleteUser(ctx: any) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    if (!user || user.role_type !== 'admin') {
      return ctx.forbidden('Access denied: Admin privileges required.');
    }

    // Resolve target user
    const targetUser = typeof id === 'string' && id.length > 10
      ? await strapi.db.query('plugin::users-permissions.user').findOne({ where: { documentId: id } })
      : await strapi.db.query('plugin::users-permissions.user').findOne({ where: { id: Number(id) } });

    if (!targetUser) {
      return ctx.notFound('User not found.');
    }

    if (targetUser.id === user.id) {
      return ctx.badRequest('You cannot delete your own active admin account.');
    }

    await strapi.db.query('plugin::users-permissions.user').delete({
      where: { id: targetUser.id },
    });

    strapi.log.info(`[ADMIN] Admin "${user.username}" deleted user "${targetUser.username}"`);

    return ctx.send({ data: { message: 'User deleted successfully.' } });
  },
});
