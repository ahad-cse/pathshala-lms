export default {
  routes: [
    {
      method: 'GET',
      path: '/enrollments/my-enrollments',
      handler: 'api::enrollment.enrollment.find',
      config: {
        policies: [],
      },
    },
  ],
};
