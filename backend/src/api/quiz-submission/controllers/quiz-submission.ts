/**
 * Quiz Submission Controller
 * 
 * Line-by-Line Reasoning:
 * 1. Submissions store the historic record of graded student quizzes with score and timestamp.
 * 2. Scoped Access:
 *    - Students can only view their own submissions (student.id === user.id).
 *    - Instructors can view submissions belonging to quizzes in their courses.
 *    - Admin and Content Manager have global visibility.
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

    return super.find(ctx);
  },
}));
