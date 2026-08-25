export default {
  routes: [
    {
      method: 'GET',
      path: '/admin-dashboard/stats',
      handler: 'api::admin-dashboard.admin-dashboard.getStats',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/admin-dashboard/users',
      handler: 'api::admin-dashboard.admin-dashboard.getUsers',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/admin-dashboard/users/:id/role',
      handler: 'api::admin-dashboard.admin-dashboard.updateUserRole',
      config: {
        policies: [],
      },
    },
    {
      method: 'DELETE',
      path: '/admin-dashboard/users/:id',
      handler: 'api::admin-dashboard.admin-dashboard.deleteUser',
      config: {
        policies: [],
      },
    },
  ],
};
