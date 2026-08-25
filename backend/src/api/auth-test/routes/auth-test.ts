export default {
  routes: [
    {
      method: 'GET',
      path: '/auth-test/admin-only',
      handler: 'auth-test.adminOnly',
      config: {
        policies: ['global::is-admin'],
      },
    },
    {
      method: 'GET',
      path: '/auth-test/content-manager-only',
      handler: 'auth-test.contentManagerOnly',
      config: {
        policies: ['global::is-content-manager'],
      },
    },
    {
      method: 'GET',
      path: '/auth-test/instructor-only',
      handler: 'auth-test.instructorOnly',
      config: {
        policies: ['global::is-instructor'],
      },
    },
    {
      method: 'GET',
      path: '/auth-test/student-only',
      handler: 'auth-test.studentOnly',
      config: {
        policies: ['global::is-student'],
      },
    },
  ],
};
