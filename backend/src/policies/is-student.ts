/**
 * Student Policy
 * 
 * Reasoning:
 * Allows access strictly to 'student' users (and 'admin' for system maintenance/testing).
 * Per the LMS specification, only Students can enroll in courses and take quizzes.
 * Returns true if allowed, false otherwise.
 */
export default (policyContext: any, config: any, { strapi }: any) => {
  const user = policyContext.state.user;

  if (!user) {
    return false;
  }

  return ['student', 'admin'].includes(user.role_type);
};
