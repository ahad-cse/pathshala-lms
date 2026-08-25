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

        // 5. Seed Comprehensive Production Dataset (10 Courses, 25+ Lessons, Quizzes & 8 Blog Posts)
        const instructorA = await strapi.db
          .query('plugin::users-permissions.user')
          .findOne({ where: { email: 'instructor@demo.com' } });

        const contentMgr = await strapi.db
          .query('plugin::users-permissions.user')
          .findOne({ where: { email: 'content@demo.com' } });

        const adminUser = await strapi.db
          .query('plugin::users-permissions.user')
          .findOne({ where: { email: 'admin@demo.com' } });

        const studentDemo = await strapi.db
          .query('plugin::users-permissions.user')
          .findOne({ where: { email: 'student@demo.com' } });

        const ALL_COURSES = [
          {
            title: 'Fullstack Next.js 15 & TypeScript Masterclass',
            description: 'Master modern full-stack development with Next.js 15 App Router, React Server Components, TypeScript, and Strapi CMS.',
            category: 'Web Development',
            cover_color: '#F2662A',
            cover_image_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
            instructorId: instructorA ? instructorA.id : null,
            lessons: [
              {
                title: 'Introduction to Next.js App Router Architecture',
                content: '# Next.js App Router\n\nDeep dive into Server Components, nested layouts, and streaming UI with Suspense.\n\n```tsx\nexport default function Page() {\n  return <h1>Hello PathShala!</h1>;\n}\n```',
                video_url: 'https://www.youtube.com/watch?v=wm5gMKuwSYk',
                order: 1,
              },
              {
                title: 'Type-Safe Data Fetching & Server Actions',
                content: '# Type-Safe Server Actions\n\nLearn how to mutate data directly from server components with zero client boilerplate.',
                video_url: 'https://www.youtube.com/watch?v=vc_0kWqP6O0',
                order: 2,
              },
              {
                title: 'Authentication & Role-Based Protected Routes',
                content: '# Role-Based Authentication\n\nSecure client routes and backend APIs using JWT tokens and middleware guards.',
                video_url: '',
                order: 3,
              },
            ],
            quiz: {
              title: 'Next.js 15 & TypeScript Mastery Quiz',
              description: 'Validate your knowledge of App Router, RSC, and server actions.',
              passing_score: 70,
              questions: [
                {
                  id: 'q1',
                  question: 'What is the default rendering mode of components inside Next.js app directory?',
                  options: ['Client Components', 'React Server Components (RSC)', 'Static HTML', 'WebSockets'],
                  correct_option_index: 1,
                  explanation: 'All components inside the app directory are React Server Components by default unless marked with "use client".',
                },
                {
                  id: 'q2',
                  question: 'Which file is used to define dynamic metadata in Next.js 15?',
                  options: ['metadata.json', 'layout.tsx / page.tsx generateMetadata', 'next.config.js', '_document.js'],
                  correct_option_index: 1,
                  explanation: 'generateMetadata function in layout.tsx or page.tsx is used for dynamic SEO tags.',
                },
              ],
            },
          },
          {
            title: 'Data Structures & Algorithms in JavaScript',
            description: 'Comprehensive foundations in computer science, algorithm complexity, tree traversals, graphs, and dynamic programming.',
            category: 'Computer Science',
            cover_color: '#4F46E5',
            cover_image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
            instructorId: contentMgr ? contentMgr.id : null,
            lessons: [
              {
                title: 'Big-O Notation & Asymptotic Complexity',
                content: '# Big-O Notation\n\nLearn how to analyze time and space complexity with real-world algorithm benchmarks.',
                video_url: 'https://www.youtube.com/watch?v=v4cd1O4zkGw',
                order: 1,
              },
              {
                title: 'Arrays, Linked Lists, Stacks, and Queues',
                content: '# Linear Data Structures\n\nImplement core data structures from scratch with memory pointer management.',
                video_url: '',
                order: 2,
              },
              {
                title: 'Binary Search Trees & Graph BFS/DFS Algorithms',
                content: '# Trees & Graphs\n\nTraverse complex non-linear graphs using Breadth-First and Depth-First search techniques.',
                video_url: '',
                order: 3,
              },
            ],
            quiz: {
              title: 'DSA Complexity & Trees Quiz',
              description: 'Test your understanding of Big-O notations and graph search algorithms.',
              passing_score: 75,
              questions: [
                {
                  id: 'q1',
                  question: 'What is the average time complexity of searching in a balanced Binary Search Tree?',
                  options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
                  correct_option_index: 2,
                  explanation: 'A balanced BST eliminates half the tree with every step, achieving O(log n) complexity.',
                },
                {
                  id: 'q2',
                  question: 'Which data structure operates on a First-In, First-Out (FIFO) principle?',
                  options: ['Stack', 'Queue', 'Array', 'Heap'],
                  correct_option_index: 1,
                  explanation: 'Queues process items in FIFO order.',
                },
              ],
            },
          },
          {
            title: 'Python, Machine Learning & Neural Networks',
            description: 'Step-by-step practical guide to NumPy, Pandas, Scikit-Learn, and PyTorch deep learning architectures.',
            category: 'Data Science & AI',
            cover_color: '#10B981',
            cover_image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
            instructorId: instructorA ? instructorA.id : null,
            lessons: [
              {
                title: 'Exploratory Data Analysis with Pandas & Seaborn',
                content: '# Data Analysis with Pandas\n\nClean, transform, and visualize structured datasets to extract actionable insights.',
                video_url: 'https://www.youtube.com/watch?v=r-uOLxNrNk8',
                order: 1,
              },
              {
                title: 'Supervised Learning: Regression & Classification',
                content: '# Supervised Learning\n\nTrain decision trees, random forests, and gradient boosting models using Scikit-Learn.',
                video_url: '',
                order: 2,
              },
              {
                title: 'Building Convolutional Neural Networks with PyTorch',
                content: '# Deep Learning & CNNs\n\nConstruct convolutional neural network layers for computer vision and image classification.',
                video_url: '',
                order: 3,
              },
            ],
            quiz: {
              title: 'Machine Learning & PyTorch Assessment',
              description: 'Verify your mastery in supervised algorithms and loss functions.',
              passing_score: 70,
              questions: [
                {
                  id: 'q1',
                  question: 'Which activation function is most commonly used in hidden layers of modern neural networks?',
                  options: ['Sigmoid', 'ReLU (Rectified Linear Unit)', 'Step Function', 'Linear'],
                  correct_option_index: 1,
                  explanation: 'ReLU avoids the vanishing gradient problem and is computationally efficient.',
                },
              ],
            },
          },
          {
            title: 'Cloud DevOps, Docker & Kubernetes Architecture',
            description: 'Architect resilient cloud infrastructure using Docker containers, Kubernetes orchestration, Helm, and GitHub Actions CI/CD.',
            category: 'DevOps & Cloud',
            cover_color: '#0D9488',
            cover_image_url: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80',
            instructorId: adminUser ? adminUser.id : null,
            lessons: [
              {
                title: 'Containerization Best Practices with Docker & Multi-stage Builds',
                content: '# Docker Containers\n\nCreate ultra-lightweight production containers with multi-stage Dockerfiles.',
                video_url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo',
                order: 1,
              },
              {
                title: 'Kubernetes Pods, Deployments & Ingress Routing',
                content: '# Kubernetes Architecture\n\nManage container clusters, self-healing replica sets, and ingress traffic controllers.',
                video_url: '',
                order: 2,
              },
              {
                title: 'Automated CI/CD Pipelines with GitHub Actions',
                content: '# Continuous Integration & Deployment\n\nAutomate test suites, security scans, and zero-downtime rolling updates.',
                video_url: '',
                order: 3,
              },
            ],
            quiz: {
              title: 'Kubernetes & CI/CD Certification Quiz',
              description: 'Assess container networking, ingress controllers, and rolling deployments.',
              passing_score: 70,
              questions: [
                {
                  id: 'q1',
                  question: 'What is the smallest deployable computing unit in a Kubernetes cluster?',
                  options: ['Container', 'Pod', 'Service', 'Deployment'],
                  correct_option_index: 1,
                  explanation: 'A Pod is the basic execution unit of Kubernetes that encapsulates one or more containers.',
                },
              ],
            },
          },
          {
            title: 'Cross-Platform Mobile Apps with React Native & Expo',
            description: 'Build native iOS and Android apps using React Native, Expo Router, NativeWind, and SQLite offline persistence.',
            category: 'Mobile App Development',
            cover_color: '#8B5CF6',
            cover_image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
            instructorId: instructorA ? instructorA.id : null,
            lessons: [
              {
                title: 'Universal File-Based Routing with Expo Router',
                content: '# Expo Router\n\nBuild cross-platform tab navigation, modals, and stack navigators with deep linking.',
                video_url: 'https://www.youtube.com/watch?v=0-S5a0eXPoc',
                order: 1,
              },
              {
                title: 'Hardware Sensor APIs & Camera Integration',
                content: '# Device APIs\n\nAccess biometric authentication, geolocation, camera streams, and haptic feedback.',
                video_url: '',
                order: 2,
              },
              {
                title: 'Offline Sync & SQLite Database Persistence',
                content: '# Offline-First Apps\n\nPersist application state locally and sync seamlessly when network connectivity restores.',
                video_url: '',
                order: 3,
              },
            ],
            quiz: {
              title: 'React Native & Mobile Architecture Quiz',
              description: 'Test your mobile state management and offline synchronization skills.',
              passing_score: 70,
              questions: [
                {
                  id: 'q1',
                  question: 'How does React Native render native UI components on iOS and Android?',
                  options: ['Inside a WebView', 'Through the JavaScript Bridge / JSI directly to native views', 'Transpiling JS to Java', 'Emulating Canvas'],
                  correct_option_index: 1,
                  explanation: 'React Native invokes real platform UI components via the JavaScript bridge / JSI.',
                },
              ],
            },
          },
          {
            title: 'UI/UX Design Systems & Figma Interactive Prototyping',
            description: 'Create scalable design systems, master Figma auto-layout, design tokens, responsive breakpoints, and micro-interactions.',
            category: 'UI/UX Design',
            cover_color: '#EC4899',
            cover_image_url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
            instructorId: contentMgr ? contentMgr.id : null,
            lessons: [
              {
                title: 'Design Tokens, Color Palettes & Modern Typography',
                content: '# Design Tokens\n\nEstablish consistent spatial scales, semantic color tokens, and accessible WCAG contrast ratios.',
                video_url: '',
                order: 1,
              },
              {
                title: 'Mastering Figma Auto Layout & Component Variants',
                content: '# Advanced Figma\n\nBuild flexible, responsive components with auto-layout padding, gap, and variant properties.',
                video_url: '',
                order: 2,
              },
            ],
          },
          {
            title: 'High-Performance Microservices with Go & gRPC',
            description: 'Build low-latency microservices with Golang, gRPC protobufs, Redis caching, and Kafka event streaming.',
            category: 'Computer Science',
            cover_color: '#0284C7',
            cover_image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
            instructorId: instructorA ? instructorA.id : null,
            lessons: [
              {
                title: 'Concurrency in Go: Goroutines & Channels',
                content: '# Go Concurrency\n\nMaster lightweight threads, channel pipelines, worker pools, and sync.WaitGroup synchronization.',
                video_url: '',
                order: 1,
              },
              {
                title: 'Building gRPC Services with Protocol Buffers',
                content: '# gRPC & Protobuf\n\nDefine binary RPC contracts and implement high-throughput inter-service communications.',
                video_url: '',
                order: 2,
              },
            ],
          },
          {
            title: 'Cybersecurity Essentials & Network Defense',
            description: 'Hands-on offensive and defensive cybersecurity: penetration testing, cryptography, OWASP Top 10 vulnerabilities, and zero-trust.',
            category: 'Computer Science',
            cover_color: '#E11D48',
            cover_image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
            instructorId: adminUser ? adminUser.id : null,
            lessons: [
              {
                title: 'Understanding OWASP Top 10 & API Security',
                content: '# OWASP Security\n\nMitigate SQL injections, Broken Object Level Authorization (BOLA), and SSRF vulnerabilities.',
                video_url: '',
                order: 1,
              },
            ],
          },
          {
            title: 'Relational Database Architecture & PostgreSQL Performance',
            description: 'Master advanced SQL, B-Tree and GIN indexing, execution plans, partition pruning, and transaction isolation levels.',
            category: 'Database Engineering',
            cover_color: '#D97706',
            cover_image_url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
            instructorId: instructorA ? instructorA.id : null,
            lessons: [
              {
                title: 'Indexing Strategies: B-Tree, Hash, GIN & BRIN Indexes',
                content: '# PostgreSQL Indexing\n\nChoose the optimal index structure to accelerate complex multi-column and JSON queries.',
                video_url: '',
                order: 1,
              },
            ],
          },
          {
            title: 'Building Modern GraphQL & Apollo APIs',
            description: 'Design unified GraphQL schemas, resolve the N+1 problem with DataLoader, and implement real-time subscriptions.',
            category: 'Web Development',
            cover_color: '#7C3AED',
            cover_image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
            instructorId: contentMgr ? contentMgr.id : null,
            lessons: [
              {
                title: 'Schema Definition Language (SDL) & Resolvers',
                content: '# GraphQL Schema\n\nDesign type-safe query, mutation, and union schemas for complex entity relationships.',
                video_url: '',
                order: 1,
              },
            ],
          },
        ];

        for (const cData of ALL_COURSES) {
          let existingCourse = await strapi.db
            .query('api::course.course')
            .findOne({ where: { title: cData.title } });

          if (!existingCourse) {
            const created = await strapi.documents('api::course.course').create({
              data: {
                title: cData.title,
                description: cData.description,
                category: cData.category,
                cover_color: cData.cover_color,
                cover_image_url: cData.cover_image_url,
                instructor: cData.instructorId,
              },
            });

            existingCourse = created as any;

            // Seed lessons
            if (cData.lessons) {
              for (const lData of cData.lessons) {
                await strapi.documents('api::lesson.lesson').create({
                  data: {
                    title: lData.title,
                    content: lData.content,
                    video_url: lData.video_url,
                    order: lData.order,
                    course: (existingCourse as any).documentId || existingCourse.id,
                  },
                });
              }
            }

            // Seed quiz
            if (cData.quiz) {
              await strapi.documents('api::quiz.quiz').create({
                data: {
                  title: cData.quiz.title,
                  description: cData.quiz.description,
                  passing_score: cData.quiz.passing_score,
                  questions: cData.quiz.questions,
                  course: (existingCourse as any).documentId || existingCourse.id,
                },
              });
            }

            strapi.log.info(`[SEED] Created Course: "${cData.title}"`);
          } else {
            // Update cover_image_url if missing
            await strapi.db.query('api::course.course').update({
              where: { id: existingCourse.id },
              data: {
                cover_image_url: (existingCourse as any).cover_image_url || cData.cover_image_url,
                category: cData.category,
              },
            });
          }
        }

        // Seed Enrollment for student@demo.com
        if (studentDemo) {
          const firstCourse = await strapi.db.query('api::course.course').findOne({});
          if (firstCourse) {
            const existingEnrollment = await strapi.db
              .query('api::enrollment.enrollment')
              .findOne({
                where: {
                  student: studentDemo.id,
                  course: firstCourse.id,
                },
              });

            if (!existingEnrollment) {
              await strapi.documents('api::enrollment.enrollment').create({
                data: {
                  student: (studentDemo as any).documentId || studentDemo.id,
                  course: (firstCourse as any).documentId || firstCourse.id,
                  enrolled_at: new Date().toISOString(),
                },
              });
            }
          }
        }

        // 6. Seed 8 Demo Blog Posts (7 Published, 1 Draft)
        const ALL_BLOG_POSTS = [
          {
            title: 'Building Scalable Full-Stack Web Applications with Next.js 15 & Strapi v5',
            slug: 'building-scalable-full-stack-web-applications',
            excerpt: 'A comprehensive architectural guide to modern headless LMS development with Next.js 15 App Router, TypeScript, and Strapi CMS.',
            content: `## Modern Headless Architecture\n\nIn modern web engineering, decoupling the presentation layer from backend content management provides unparalleled flexibility, rapid iteration velocity, and robust security boundaries.\n\n### Why Next.js 15 App Router?\n\nNext.js 15 brings React Server Components (RSC), Turbopack compilation speeds, and streaming server rendering directly to full-stack applications.\n\n- **Type Safety**: End-to-end typing across client components and server actions.\n- **Zero-Bundle Overhead**: Server components execute on the server and transmit zero JavaScript to the browser.\n- **Optimized Asset Delivery**: Built-in font, image, and script optimization engines.\n\n### Strapi v5 Headless Engine\n\nStrapi v5 introduces the Document Service API, fine-grained draft & publish management, and scalable SQL database abstractions.`,
            cover_image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
            is_published: true,
            published_date: new Date().toISOString(),
          },
          {
            title: 'Mastering Asynchronous JavaScript: Event Loops, Promises & Async/Await',
            slug: 'mastering-asynchronous-javascript-event-loops-promises',
            excerpt: 'Understand how JavaScript executes non-blocking code under the hood with microtask queues, macrotasks, and concurrency models.',
            content: `## The JavaScript Concurrency Model\n\nJavaScript is single-threaded, meaning it has only one call stack. However, the runtime engine handles asynchronous I/O with incredible efficiency using the Event Loop.\n\n### Call Stack vs. Task Queues\n\n- **Call Stack**: Executes synchronous function calls.\n- **Microtask Queue**: Handles Promises (\`.then()\`, \`async/await\`) and \`queueMicrotask()\`. Runs immediately after stack frames clear.\n- **Macrotask Queue**: Handles \`setTimeout\`, \`setInterval\`, and I/O callbacks.`,
            cover_image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
            is_published: true,
            published_date: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            title: 'Architecting Resilient Event-Driven Microservices with Kafka',
            slug: 'architecting-resilient-event-driven-microservices-kafka',
            excerpt: 'How to decouple backend systems using distributed message brokers, transactional outboxes, and idempotent consumers.',
            content: `## Event-Driven Architecture (EDA)\n\nSynchronous REST calls create tight coupling and cascading failure modes between microservices. An event-driven architecture allows services to emit events and react asynchronously.\n\n### Key Architectural Patterns\n\n1. **Transactional Outbox Pattern**: Store business domain changes and outbound events in the same database transaction to prevent dual-write inconsistencies.\n2. **Idempotent Consumers**: Deduplicate messages using unique event IDs and atomic distributed locks.`,
            cover_image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
            is_published: true,
            published_date: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            title: 'Securing Web Applications with Role-Based Access Control (RBAC)',
            slug: 'securing-web-applications-with-rbac-architecture',
            excerpt: 'Best practices for implementing multi-tier permission policies, JWT claims validation, and server-side policy guards.',
            content: `## Security at the API Boundary\n\nA critical rule of modern web security: **never trust the client**. Hiding a button in the frontend UI provides zero security if the backend endpoint allows unauthenticated or unauthorized access.\n\n### The 4 Principles of Robust RBAC\n\n- **Principle of Least Privilege**: Users receive only the minimum permissions necessary.\n- **Stateless Verification**: JWT tokens encode verifiable cryptographic signatures.\n- **Scoped Controllers**: Database queries filter rows automatically based on authenticated user IDs and roles.`,
            cover_image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
            is_published: true,
            published_date: new Date(Date.now() - 259200000).toISOString(),
          },
          {
            title: 'The Comprehensive Guide to Modern CSS Grid & Container Queries',
            slug: 'comprehensive-guide-modern-css-grid-container-queries',
            excerpt: 'Build ultra-responsive component layouts based on parent container dimensions rather than rigid viewport media queries.',
            content: `## Beyond Media Queries: Container Queries\n\nFor years, responsive design was constrained by viewport width (\`@media\`). With Container Queries (\`@container\`), components can style themselves dynamically based on the width of their immediate parent wrapper!\n\n### CSS Grid Mastery\n\nUsing \`repeat(auto-fill, minmax(min(100%, 300px), 1fr))\` allows responsive cards to wrap smoothly on all screen sizes without horizontal scrollbars.`,
            cover_image_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
            is_published: true,
            published_date: new Date(Date.now() - 345600000).toISOString(),
          },
          {
            title: 'Demystifying Vector Embeddings and Semantic AI Search',
            slug: 'demystifying-vector-embeddings-and-semantic-ai-search',
            excerpt: 'How high-dimensional vector embeddings, cosine similarity, and vector databases power modern semantic retrieval and RAG systems.',
            content: `## What are Vector Embeddings?\n\nVector embeddings transform text, audio, and images into dense numerical vectors in multi-dimensional space. Words and concepts with similar semantic meanings cluster closer together.\n\n### Cosine Similarity & Retrieval\n\nBy computing the dot product between query embeddings and document embeddings, search engines can retrieve highly relevant results even without exact keyword matches.`,
            cover_image_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80',
            is_published: true,
            published_date: new Date(Date.now() - 432000000).toISOString(),
          },
          {
            title: 'Scaling Real-Time WebSockets for Millions of Concurrent Connections',
            slug: 'scaling-real-time-websockets-for-millions-concurrent-users',
            excerpt: 'Architecting horizontal WebSocket clusters with Redis Pub/Sub backplanes and connection connection pooling.',
            content: `## Real-Time Streaming Architecture\n\nMaintaining persistent full-duplex TCP connections at scale requires efficient memory footprint management, heartbeat keep-alives, and distributed pub/sub brokers.\n\n### Redis Pub/Sub Backplane\n\nWhen a client on Server A broadcasts an event to a room on Server B, Redis acts as the central message bus distributing packets across all instances in milliseconds.`,
            cover_image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
            is_published: true,
            published_date: new Date(Date.now() - 518400000).toISOString(),
          },
          {
            title: 'Draft: Zero-Downtime Database Migrations in High-Traffic Production',
            slug: 'draft-zero-downtime-database-migrations-production',
            excerpt: 'Engineering guide to expand-contract schema changes, backward-compatible column migrations, and shadow writes.',
            content: `## Internal Engineering Draft\n\n1. **Expand Phase**: Add new nullable columns or dual-write triggers.\n2. **Migrate Phase**: Backfill historical rows in small batches.\n3. **Contract Phase**: Deprecate old columns and remove dead code.`,
            cover_image_url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&auto=format&fit=crop&q=80',
            is_published: false,
          },
        ];

        for (const bData of ALL_BLOG_POSTS) {
          const bExist = await strapi.db
            .query('api::blog-post.blog-post')
            .findOne({ where: { slug: bData.slug } });

          if (!bExist) {
            await strapi.documents('api::blog-post.blog-post').create({
              data: {
                ...bData,
                author: contentMgr ? (contentMgr as any).documentId || contentMgr.id : undefined,
              },
            });
            strapi.log.info(`[SEED] Created Blog Post: "${bData.title}"`);
          } else {
            await strapi.db.query('api::blog-post.blog-post').update({
              where: { id: bExist.id },
              data: {
                cover_image_url: (bExist as any).cover_image_url || bData.cover_image_url,
                excerpt: (bExist as any).excerpt || bData.excerpt,
              },
            });
          }
        }
      }
    } catch (err) {
      strapi.log.error('[BOOTSTRAP] Error during role, course, enrollment & quiz bootstrap:', err);
    }
  },
};
