import type { Core } from '@strapi/strapi';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {
    try {
      const fs = require("fs");
      const path = require("path");
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    } catch (e) {
      console.warn("Could not auto-create upload directory:", e);
    }
  },

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

      const progressActions = [
        'api::progress.progress.find',
        'api::progress.progress.findOne',
        'api::progress.progress.create',
        'api::progress.progress.delete',
        'api::progress.progress.toggleLesson',
        'api::progress.progress.getCourseProgress',
      ];

      const quizActions = [
        'api::quiz.quiz.find',
        'api::quiz.quiz.findOne',
        'api::quiz.quiz.create',
        'api::quiz.quiz.update',
        'api::quiz.quiz.delete',
        'api::quiz.quiz.submitQuiz',
        'api::quiz.quiz.getByCourse',
      ];

      const quizSubmissionActions = [
        'api::quiz-submission.quiz-submission.find',
        'api::quiz-submission.quiz-submission.findOne',
        'api::quiz-submission.quiz-submission.create',
        'api::quiz-submission.quiz-submission.delete',
      ];

      const adminDashboardActions = [
        'api::admin-dashboard.admin-dashboard.getStats',
        'api::admin-dashboard.admin-dashboard.getUsers',
        'api::admin-dashboard.admin-dashboard.updateUserRole',
        'api::admin-dashboard.admin-dashboard.deleteUser',
      ];

      const blogPostActions = [
        'api::blog-post.blog-post.find',
        'api::blog-post.blog-post.findOne',
        'api::blog-post.blog-post.create',
        'api::blog-post.blog-post.update',
        'api::blog-post.blog-post.delete',
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
        'plugin::users-permissions.auth.register',
        'plugin::users-permissions.auth.callback',
      ];

      if (authenticatedRole) {
        const allAuthActions = [
          ...userActions,
          ...authTestActions,
          ...courseActions,
          ...lessonActions,
          ...enrollmentActions,
          ...progressActions,
          ...quizActions,
          ...quizSubmissionActions,
          ...adminDashboardActions,
          ...blogPostActions,
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
          'api::blog-post.blog-post.find',
          'api::blog-post.blog-post.findOne',
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
            full_name: 'System Admin',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            role_type: 'admin',
          },
          {
            username: 'content_manager',
            email: 'content@demo.com',
            full_name: 'Nusrat Jahan',
            avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            role_type: 'content_manager',
          },
          {
            username: 'instructor',
            email: 'instructor@demo.com',
            full_name: 'Dr. Rafiqul Islam',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            role_type: 'instructor',
          },
          {
            username: 'instructor_b',
            email: 'instructor_b@demo.com',
            full_name: 'Farhana Ahmed',
            avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            role_type: 'instructor',
          },
          {
            username: 'student',
            email: 'student@demo.com',
            full_name: 'Tanvir Ahmed',
            avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
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

        // Seed Sample Quiz for Course 1 if none exists
        if (course1) {
          const existingQuiz = await strapi.db
            .query('api::quiz.quiz')
            .findOne({
              where: {
                course: course1.id,
              },
            });

          if (!existingQuiz) {
            const courseDoc = (course1 as any).documentId;

            await strapi.documents('api::quiz.quiz').create({
              data: {
                title: 'Next.js & TypeScript Mastery Quiz',
                description: 'Test your understanding of Next.js 15 App Router, Server Components, and Type-safe API architecture.',
                passing_score: 70,
                course: courseDoc || course1.id,
                questions: [
                  {
                    id: 'q1',
                    question: 'Which directory structure is used by Next.js 15 App Router for routing?',
                    options: [
                      'pages/ directory',
                      'app/ directory',
                      'routes/ directory',
                      'src/controllers/ directory'
                    ],
                    correct_option_index: 1,
                    explanation: 'Next.js App Router uses the app/ directory with nested folders and page.tsx files.'
                  },
                  {
                    id: 'q2',
                    question: 'Where should access control and role-based permissions strictly be enforced?',
                    options: [
                      'Frontend UI only (hiding buttons)',
                      'Browser localStorage checks',
                      'Backend policies & custom controllers',
                      'CSS display:none rules'
                    ],
                    correct_option_index: 2,
                    explanation: 'Security boundaries must always be enforced on the backend via policies and controller guards.'
                  },
                  {
                    id: 'q3',
                    question: 'What is the default rendering mode of components inside the app/ directory?',
                    options: [
                      'Client Components',
                      'React Server Components (RSC)',
                      'Static HTML exports only',
                      'WebSockets streams'
                    ],
                    correct_option_index: 1,
                    explanation: 'By default, all components inside the app directory are React Server Components unless annotated with "use client".'
                  }
                ],
              },
            });

            strapi.log.info('[SEED] Created Demo Quiz for Course 1');
          }
        }

        // 6. Seed Demo Blog Posts (1 Published, 1 Draft)
        const blogCount = await strapi.db.query('api::blog-post.blog-post').count();
        if (blogCount === 0) {
          const cmUser = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { email: 'content@demo.com' },
          });

          if (cmUser) {
            // Published Article
            await strapi.documents('api::blog-post.blog-post').create({
              data: {
                title: 'Building Scalable Full-Stack Web Applications with Next.js 15 & Strapi v5',
                slug: 'building-scalable-full-stack-web-applications',
                excerpt: 'A comprehensive architectural guide to modern headless LMS development with Next.js 15 App Router, TypeScript, and Strapi CMS.',
                content: `## Modern Headless Architecture

In modern web engineering, decoupling the presentation layer from backend content management provides unparalleled flexibility, rapid iteration velocity, and robust security boundaries.

### Why Next.js 15 App Router?

Next.js 15 brings React Server Components (RSC), Turbopack compilation speeds, and streaming server rendering directly to full-stack applications.

- **Type Safety**: End-to-end typing across client components and server actions.
- **Zero-Bundle Overhead**: Server components execute on the server and transmit zero JavaScript to the browser.
- **Optimized Asset Delivery**: Built-in font, image, and script optimization engines.

### Strapi v5 Headless Engine

Strapi v5 introduces the Document Service API, fine-grained draft & publish management, and scalable SQL/SQLite database query abstractions.

### Role-Based Access Control (RBAC)

Security is never an afterthought. Enforcing role checks on the backend (using custom Strapi policies and scoped controllers) ensures that sensitive operations cannot be triggered by tampering with client-side UI elements.

Happy Coding with PathShala LMS!`,
                cover_image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
                is_published: true,
                published_date: new Date().toISOString(),
                author: cmUser.documentId,
              },
            });

            // Draft Article (For testing draft isolation)
            await strapi.documents('api::blog-post.blog-post').create({
              data: {
                title: 'Draft: Advanced Microservices & Distributed System Architecture',
                slug: 'draft-advanced-microservices-distributed-architecture',
                excerpt: 'Unpublished internal draft exploring event-driven architectures, Kafka message brokers, and transactional outbox patterns.',
                content: `## Internal Engineering Draft — DO NOT PUBLISH

This document contains preliminary design benchmarks for distributed event streaming:

1. **Transactional Outbox Pattern**: Prevent dual-write anomalies between PostgreSQL and Kafka.
2. **Idempotent Consumers**: Deduplicate messages using unique Redis idempotency keys.
3. **Circuit Breakers**: Implement resilient fallbacks during downstream microservice degradations.`,
                cover_image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
                is_published: false,
                author: cmUser.documentId,
              },
            });

            strapi.log.info('[SEED] Created 2 Demo Blog Posts (1 Published, 1 Draft)');
          }
        }
      }
    } catch (err) {
      strapi.log.error('[BOOTSTRAP] Error during role, course, enrollment & quiz bootstrap:', err);
    }
  },
};
