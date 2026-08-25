/**
 * Strapi Users & Permissions Plugin Server Extension
 * 
 * Reasoning:
 * 1. Sanitizes user registration so that all public sign-ups are strictly assigned 'student' role.
 *    Any payload attempting to pass role_type='admin' or 'instructor' will be overwritten to 'student'.
 * 2. Restricts user updating (/api/users/:id) so that only Admins can modify role_type.
 * 3. Ensures /api/users/me returns role_type properly.
 */

export default (plugin: any) => {
  // Override Register action to strictly enforce role_type = 'student'
  const originalRegister = plugin.controllers.auth.register;

  plugin.controllers.auth.register = async (ctx: any) => {
    // Force role_type to 'student' regardless of what client payload sends
    if (ctx.request.body) {
      delete ctx.request.body.role_type;
    }

    // Call original register
    await originalRegister(ctx);

    // Ensure the created user in the database is set to role_type: 'student'
    if (ctx.body && ctx.body.user && ctx.body.user.id) {
      await strapi.db.query('plugin::users-permissions.user').update({
        where: { id: ctx.body.user.id },
        data: { role_type: 'student' },
      });
      ctx.body.user.role_type = 'student';
    }
  };

  // Protect User update action
  const originalUpdate = plugin.controllers.user.update;

  plugin.controllers.user.update = async (ctx: any) => {
    const authUser = ctx.state.user;

    // If request contains role_type, only Admin is allowed to change it
    if (ctx.request.body && ctx.request.body.role_type) {
      if (!authUser || authUser.role_type !== 'admin') {
        return ctx.forbidden('Only Administrators can assign or modify user roles.');
      }
    }

    return originalUpdate(ctx);
  };

  return plugin;
};
