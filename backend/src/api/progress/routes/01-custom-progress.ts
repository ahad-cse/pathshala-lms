export default {
  routes: [
    {
      method: 'POST',
      path: '/progress/toggle',
      handler: 'api::progress.progress.toggleLesson',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/progress/course/:courseId',
      handler: 'api::progress.progress.getCourseProgress',
      config: {
        policies: [],
      },
    },
  ],
};
