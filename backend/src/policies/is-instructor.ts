/**
 * Instructor Policy
 * 
 * Reasoning:
 * Allows access if the user is an 'instructor' (or higher: 'content_manager', 'admin').
 * Instructors are allowed to create courses/lessons/quizzes and view enrolled student progress.
 * Returns true if allowed, false otherwise.
 */
export default (policyContext: any, config: any, { strapi }: any) => {
  const user = policyContext.state.user;

  if (!user) {
    return false;
  }

  return ['admin', 'content_manager', 'instructor'].includes(user.role_type);
};
