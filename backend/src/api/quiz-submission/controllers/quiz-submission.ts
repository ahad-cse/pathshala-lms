/**
 * Quiz Submission Controller
 * Manages student quiz submissions with role-scoped access control.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz-submission.quiz-submission', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to view quiz submissions.');
    }

    ctx.query = {
      ...ctx.query,
      populate: {
        quiz: {
          populate: ['course'],
        },
        student: {
          fields: ['id', 'username', 'email', 'role_type'],
        },
        ...(typeof ctx.query.populate === 'object' ? ctx.query.populate : {}),
      },
    };

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

    // If Instructor, strictly scope to submissions for own courses
    if (user.role_type === 'instructor') {
      ctx.query.filters = {
        ...(typeof ctx.query.filters === 'object' ? ctx.query.filters : {}),
        quiz: {
          course: {
            instructor: {
              id: {
                $eq: user.id,
              },
            },
          },
        },
      };
    }

    return super.find(ctx);
  },
}));
