/**
 * Admin Policy
 * 
 * Reasoning:
 * Enforces that only users with the 'admin' role can access the route.
 * Admin has full privileges to manage users, assign roles, and administer platform content.
 * Returns true if user.role_type === 'admin', otherwise false (403 Forbidden).
 */
export default (policyContext: any, config: any, { strapi }: any) => {
  const user = policyContext.state.user;

  if (!user) {
    return false;
  }

  return user.role_type === 'admin';
};
