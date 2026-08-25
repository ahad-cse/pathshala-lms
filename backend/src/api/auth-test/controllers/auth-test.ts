export default {
  adminOnly: async (ctx: any) => {
    return ctx.send({
      success: true,
      role: ctx.state.user.role_type,
      message: 'Access granted: Admin only route',
    });
  },

  contentManagerOnly: async (ctx: any) => {
    return ctx.send({
      success: true,
      role: ctx.state.user.role_type,
      message: 'Access granted: Content Manager route',
    });
  },

  instructorOnly: async (ctx: any) => {
    return ctx.send({
      success: true,
      role: ctx.state.user.role_type,
      message: 'Access granted: Instructor route',
    });
  },

  studentOnly: async (ctx: any) => {
    return ctx.send({
      success: true,
      role: ctx.state.user.role_type,
      message: 'Access granted: Student route',
    });
  },
};
