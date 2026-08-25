export default {
  routes: [
    {
      method: 'POST',
      path: '/quizzes/:quizId/submit',
      handler: 'api::quiz.quiz.submitQuiz',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/quizzes/course/:courseId',
      handler: 'api::quiz.quiz.getByCourse',
      config: {
        policies: [],
      },
    },
  ],
};
