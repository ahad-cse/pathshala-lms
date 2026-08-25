import type { Core } from '@strapi/strapi';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      // Find the Authenticated and Public roles in users-permissions
      const authenticatedRole = await strapi.db
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'authenticated' } });

      const publicRole = await strapi.db
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      const courseActions = [
        'api::course.course.find',
        'api::course.course.findOne',
        'api::course.course.create',
        'api::course.course.update',
        'api::course.course.delete',
      ];

      const lessonActions = [
        'api::lesson.lesson.find',
        'api::lesson.lesson.findOne',
        'api::lesson.lesson.create',
        'api::lesson.lesson.update',
        'api::lesson.lesson.delete',
      ];

      const enrollmentActions = [
        'api::enrollment.enrollment.find',
        'api::enrollment.enrollment.findOne',
        'api::enrollment.enrollment.create',
        'api::enrollment.enrollment.update',
        'api::enrollment.enrollment.delete',
      ];

      const authTestActions = [
        'api::auth-test.auth-test.adminOnly',
        'api::auth-test.auth-test.contentManagerOnly',
        'api::auth-test.auth-test.instructorOnly',
        'api::auth-test.auth-test.studentOnly',
      ];

      const userActions = [
        'plugin::users-permissions.user.me',
        'plugin::users-permissions.user.find',
        'plugin::users-permissions.user.findOne',
      ];

      if (authenticatedRole) {
        const allAuthActions = [
          ...userActions,
          ...authTestActions,
          ...courseActions,
          ...lessonActions,
          ...enrollmentActions,
        ];

        for (const action of allAuthActions) {
          const perm = await strapi.db
            .query('plugin::users-permissions.permission')
            .findOne({
              where: {
                action,
                role: authenticatedRole.id,
              },
            });

          if (!perm) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: authenticatedRole.id,
              },
            });
          }
        }
      }

      if (publicRole) {
        const publicActions = [
          'plugin::users-permissions.auth.callback',
          'plugin::users-permissions.auth.register',
          'api::course.course.find',
          'api::course.course.findOne',
          'api::lesson.lesson.find',
          'api::lesson.lesson.findOne',
        ];

        for (const action of publicActions) {
          const perm = await strapi.db
            .query('plugin::users-permissions.permission')
            .findOne({
              where: {
                action,
                role: publicRole.id,
              },
            });

          if (!perm) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: publicRole.id,
              },
            });
          }
        }
      }

      // Seed / ensure 5 test demo accounts
      if (authenticatedRole) {
        const demoUsers = [
          {
            username: 'admin',
            email: 'admin@demo.com',
            role_type: 'admin',
          },
          {
            username: 'content_manager',
            email: 'content@demo.com',
            role_type: 'content_manager',
          },
          {
            username: 'instructor',
            email: 'instructor@demo.com',
            role_type: 'instructor',
          },
          {
            username: 'instructor_b',
            email: 'instructor_b@demo.com',
            role_type: 'instructor',
          },
          {
            username: 'student',
            email: 'student@demo.com',
            role_type: 'student',
          },
        ];

        const defaultPassword = 'Password123!';

        for (const demo of demoUsers) {
          const existingUser = await strapi.db
            .query('plugin::users-permissions.user')
            .findOne({ where: { email: demo.email } });

          if (!existingUser) {
            await strapi.plugin('users-permissions').service('user').add({
              username: demo.username,
              email: demo.email,
              password: defaultPassword,
              role_type: demo.role_type,
              role: authenticatedRole.id,
              confirmed: true,
              blocked: false,
              provider: 'local',
            });

            strapi.log.info(
              `[SEED] Created demo user: ${demo.email} with role: ${demo.role_type}`
            );
          } else {
            await strapi.plugin('users-permissions').service('user').edit(existingUser.id, {
              password: defaultPassword,
              role_type: demo.role_type,
              confirmed: true,
              blocked: false,
            });
          }
        }

        // Seed Sample Courses & Lessons if none exist
        const instructorA = await strapi.db
          .query('plugin::users-permissions.user')
          .findOne({ where: { email: 'instructor@demo.com' } });

        const contentMgr = await strapi.db
          .query('plugin::users-permissions.user')
          .findOne({ where: { email: 'content@demo.com' } });

        const studentDemo = await strapi.db
          .query('plugin::users-permissions.user')
          .findOne({ where: { email: 'student@demo.com' } });

        let course1 = await strapi.db
          .query('api::course.course')
          .findOne({ where: { title: 'Fullstack Next.js & TypeScript Masterclass' } });

        if (!course1 && instructorA) {
          const createdCourse1 = await strapi.documents('api::course.course').create({
            data: {
              title: 'Fullstack Next.js & TypeScript Masterclass',
              description:
                'Master modern full-stack development with Next.js 15 App Router, TypeScript, and Strapi CMS.',
              category: 'Web Development',
              cover_color: '#F2662A',
              instructor: instructorA.id,
            },
          });

          await strapi.documents('api::lesson.lesson').create({
            data: {
              title: 'Introduction to Next.js App Router',
              content:
                '# Introduction to Next.js App Router\n\nIn this lesson, we explore Next.js App Router architecture, Server Components, and client transitions.\n\n```tsx\nexport default function Page() {\n  return <h1>Hello PathShala!</h1>;\n}\n```',
              video_url: 'https://www.youtube.com/watch?v=wm5gMKuwSYk',
              order: 1,
              course: (createdCourse1 as any).documentId || createdCourse1.id,
            },
          });

          await strapi.documents('api::lesson.lesson').create({
            data: {
              title: 'Building Type-safe APIs with Strapi',
              content:
                '# Building Type-safe APIs with Strapi\n\nLearn how to extend Strapi content-types, implement custom controllers, and enforce role-based security policies.\n\n- Custom Controllers\n- Document Service\n- Permission Policies',
              video_url: 'https://www.youtube.com/watch?v=vc_0kWqP6O0',
              order: 2,
              course: (createdCourse1 as any).documentId || createdCourse1.id,
            },
          });

          await strapi.documents('api::lesson.lesson').create({
            data: {
              title: 'State Management & Progress Persistence',
              content:
                '# State Management & Progress Persistence\n\nDeep dive into client-side state synchronization, optimistic UI updates, and backend percentage calculations.',
              video_url: '',
              order: 3,
              course: (createdCourse1 as any).documentId || createdCourse1.id,
            },
          });

          course1 = createdCourse1 as any;
          strapi.log.info('[SEED] Created Course 1 with 3 lessons for instructor@demo.com');
        } else if (course1 && instructorA) {
          // Link instructor if missing
          await strapi.db.query('api::course.course').update({
            where: { id: course1.id },
            data: { instructor: instructorA.id },
          });
        }

        const existingCourse2 = await strapi.db
          .query('api::course.course')
          .findOne({ where: { title: 'Data Structures & Algorithms in JavaScript' } });

        if (!existingCourse2 && contentMgr) {
          const course2 = await strapi.documents('api::course.course').create({
            data: {
              title: 'Data Structures & Algorithms in JavaScript',
              description:
                'Comprehensive foundations in computer science, algorithm complexity, graphs, and dynamic programming.',
              category: 'Computer Science',
              cover_color: '#4F46E5',
              instructor: contentMgr.id,
            },
          });

          await strapi.documents('api::lesson.lesson').create({
            data: {
              title: 'Big-O Notation & Time Complexity',
              content:
                '# Big-O Notation & Time Complexity\n\nUnderstanding asymptotic analysis, best/worst/average case time and space complexity.',
              video_url: 'https://www.youtube.com/watch?v=v4cd1O4zkGw',
              order: 1,
              course: (course2 as any).documentId || course2.id,
            },
          });

          await strapi.documents('api::lesson.lesson').create({
            data: {
              title: 'Arrays, Stacks, and Queues',
              content:
                '# Arrays, Stacks, and Queues\n\nImplementing core linear data structures from scratch with memory considerations.',
              video_url: '',
              order: 2,
              course: (course2 as any).documentId || course2.id,
            },
          });

          strapi.log.info('[SEED] Created Course 2 with 2 lessons for content@demo.com');
        } else if (existingCourse2 && contentMgr) {
          await strapi.db.query('api::course.course').update({
            where: { id: existingCourse2.id },
            data: { instructor: contentMgr.id },
          });
        }

        // Seed Enrollment for student@demo.com in Course 1
        if (studentDemo && course1) {
          const existingEnrollment = await strapi.db
            .query('api::enrollment.enrollment')
            .findOne({
              where: {
                student: studentDemo.id,
                course: course1.id,
              },
            });

          if (!existingEnrollment) {
            const studentDoc = (studentDemo as any).documentId;
            const courseDoc = (course1 as any).documentId;

            await strapi.documents('api::enrollment.enrollment').create({
              data: {
                student: studentDoc || studentDemo.id,
                course: courseDoc || course1.id,
                enrolled_at: new Date().toISOString(),
              },
            });

            strapi.log.info(
              `[SEED] Enrolled student@demo.com in Course 1 ("${course1.title}")`
            );
          }
        }
      }
    } catch (err) {
      strapi.log.error('[BOOTSTRAP] Error during role, course & enrollment bootstrap:', err);
    }
  },
};
