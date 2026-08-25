/**
 * Content Manager Policy
 * 
 * Reasoning:
 * Allows access if the authenticated user has either 'admin' or 'content_manager' role.
 * Content Managers have global permissions to create and manage courses/lessons/blogs,
 * while Admins inherit all content management privileges.
 * Returns true if allowed, false otherwise.
 */
export default (policyContext: any, config: any, { strapi }: any) => {
  const user = policyContext.state.user;

  if (!user) {
    return false;
  }

  return ['admin', 'content_manager'].includes(user.role_type);
};
