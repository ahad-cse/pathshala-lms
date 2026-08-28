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

                // Purge legacy non-CP courses if any exist
        const oldCourses = await strapi.db.query('api::course.course').findMany({
          where: {
            category: {
              $notIn: ['Competitive Programming', 'Mathematics', 'Algorithms', 'Computer Science'],
            },
          },
        });

        for (const oc of oldCourses) {
          try {
            await strapi.documents('api::course.course').delete({ documentId: oc.documentId });
          } catch (e) {}
        }

        const ALL_COURSES = [
          {
            title: 'C Programming Fundamentals & Logic Building',
            description: 'Start your programming journey from scratch with C language. Master conditional logic, nested loops, pattern printing, pointers, and memory layout for competitive coding.',
            category: 'Competitive Programming',
            cover_color: '#0284C7',
            cover_image_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=80',
            instructorId: instructorA ? instructorA.documentId || instructorA.id : null,
            lessons: [
              {
                title: 'Setting up GCC, Code::Blocks and Fast I/O in C',
                content: '## Getting Started with C\n\nLearn compiler setup, integer data types (`int`, `long long`), scanf/printf format specifiers, and basic input/output operations.',
                video_url: 'https://www.youtube.com/watch?v=kYV3u2o6L_E',
                order: 1,
              },
              {
                title: 'Conditionals, Logic Building & Flow Control',
                content: '## Conditional Branching\n\nMaster `if-else`, ternary operators, and logical operators (`&&`, `||`, `!`) to solve basic decision problems.',
                video_url: 'https://www.youtube.com/watch?v=4-iH-Y4P-uU',
                order: 2,
              },
              {
                title: 'Nested Loops & Pyramid Pattern Printing',
                content: '## Loop Control & Patterns\n\nBuild solid algorithmic intuition with 2D loops, star patterns, number pyramids, and break/continue statements.',
                video_url: 'https://www.youtube.com/watch?v=O-U-D-K-q-A',
                order: 3,
              },
              {
                title: '1D & 2D Arrays, Memory Layout & Pointers',
                content: '## Arrays & Pointers in C\n\nContiguous memory allocation, 0-indexed arrays, pointer arithmetic, and passing arrays to functions by reference.',
                video_url: 'https://www.youtube.com/watch?v=S-p-U-u-q-b-7',
                order: 4,
              },
            ],
            quiz: {
              title: 'C Fundamentals & Logic Assessment',
              description: 'Test your fundamentals in C syntax, pointer references, and operator precedence.',
              passing_score: 70,
              questions: [
                {
                  id: 'q1',
                  question: 'Which format specifier is used to read a 64-bit integer (long long int) in C using scanf?',
                  options: ['%d', '%lld', '%ld', '%f'],
                  correct_option_index: 1,
                  explanation: '%lld is standard for signed 64-bit integers (long long int) in C99 and modern compilers.',
                },
                {
                  id: 'q2',
                  question: 'What is the output of sizeof(int*) on a standard 64-bit operating system?',
                  options: ['4 bytes', '8 bytes', '2 bytes', '16 bytes'],
                  correct_option_index: 1,
                  explanation: 'On 64-bit architectures, all memory address pointers occupy 8 bytes (64 bits).',
                },
                {
                  id: 'q3',
                  question: 'What happens when an array index out of bounds is accessed in C?',
                  options: ['Compiler throws an error', 'Throws an IndexOutOfBoundsException', 'Undefined Behavior (may read garbage or crash with Segfault)', 'Returns 0 by default'],
                  correct_option_index: 2,
                  explanation: 'C does not perform bounds checking; accessing out of bounds results in Undefined Behavior.',
                },
              ],
            },
          },
          {
            title: 'C++ STL Mastery for Competitive Programming',
            description: 'Master Standard Template Library (STL) containers, iterators, custom comparators, and algorithms specifically tailored for Codeforces, AtCoder, and ICPC contests.',
            category: 'Competitive Programming',
            cover_color: '#F2662A',
            cover_image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
            instructorId: instructorA ? instructorA.documentId || instructorA.id : null,
            lessons: [
              {
                title: 'Introduction to C++ STL Vector & Dynamic Arrays',
                content: '## C++ STL Vector Fundamentals\n\nVectors are dynamic contiguous arrays with automatic resizing capabilities.',
                video_url: 'https://www.youtube.com/watch?v=kYV3u2o6L_E',
                order: 1,
              },
              {
                title: 'STL Pair, Vector of Pairs & Sorting Techniques',
                content: '## Pair & Vector of Pairs\n\n`std::pair<T1, T2>` allows bundling two heterogeneous values.',
                video_url: 'https://www.youtube.com/watch?v=kYV3u2o6L_E',
                order: 2,
              },
              {
                title: 'C++ STL String Manipulation & Fast Parsing',
                content: '## String Processing in CP\n\n- `string s; getline(cin, s);`\n- `s.substr(pos, len)` — Extract substring in O(len)',
                video_url: 'https://www.youtube.com/watch?v=4-iH-Y4P-uU',
                order: 3,
              },
              {
                title: 'STL Map vs. Unordered Map & Frequency Counting',
                content: '## Map (`std::map`) vs Unordered Map (`std::unordered_map`)',
                video_url: 'https://www.youtube.com/watch?v=4-iH-Y4P-uU',
                order: 4,
              },
              {
                title: 'STL Set, Multiset & Order Tracking',
                content: '## Sets & Multisets\n\n- `std::set<int>`: Maintains unique sorted elements in O(log N).',
                video_url: 'https://www.youtube.com/watch?v=O-U-D-K-q-A',
                order: 5,
              },
              {
                title: 'Priority Queue (Min-Heap / Max-Heap) & Greedy Strategies',
                content: '## Priority Queue\n\n- Max-Heap: `priority_queue<int> pq;`\n- Min-Heap: `priority_queue<int, vector<int>, greater<int>> min_pq;`',
                video_url: 'https://www.youtube.com/watch?v=O-U-D-K-q-A',
                order: 6,
              },
            ],
            quiz: {
              title: 'C++ STL & Asymptotic Efficiency Assessment',
              description: 'Comprehensive multiple-choice assessment on C++ STL time complexities, corner cases, and anti-hash strategies.',
              passing_score: 70,
              questions: [
                {
                  id: 'q1',
                  question: 'What is the time complexity of inserting N elements into a std::map<int, int>?',
                  options: ['O(N)', 'O(N log N)', 'O(1)', 'O(N^2)'],
                  correct_option_index: 1,
                  explanation: 'Each insertion in a std::map takes O(log K) where K is the current size. Inserting N elements takes O(N log N) total time.',
                },
                {
                  id: 'q2',
                  question: 'In std::multiset<int> ms, which operation erases exactly one instance of integer x?',
                  options: ['ms.erase(x);', 'ms.erase(ms.find(x));', 'ms.remove_one(x);', 'ms.pop(x);'],
                  correct_option_index: 1,
                  explanation: 'ms.erase(x) erases all occurrences of x. To erase a single instance, pass the iterator: ms.erase(ms.find(x)).',
                },
                {
                  id: 'q3',
                  question: 'Why can std::unordered_map lead to Time Limit Exceeded (TLE) on Codeforces tests?',
                  options: [
                    'Because it is written in C instead of modern C++',
                    'Because malicious test cases can cause hash collisions degrading lookup to O(N)',
                    'Because it reallocates memory on every single insertion',
                    'Because it sorts elements internally in descending order',
                  ],
                  correct_option_index: 1,
                  explanation: 'Default hash functions for primitive types in libstdc++ have known collision patterns that adversaries exploit in contest anti-hash tests.',
                },
                {
                  id: 'q4',
                  question: 'What is the correct syntax for declaring a Min-Heap priority queue in C++ STL?',
                  options: [
                    'priority_queue<int, min> pq;',
                    'priority_queue<int, vector<int>, greater<int>> pq;',
                    'min_priority_queue<int> pq;',
                    'priority_queue<int, descending> pq;',
                  ],
                  correct_option_index: 1,
                  explanation: 'std::priority_queue<int, vector<int>, greater<int>> creates a min-heap where the smallest element is at the top.',
                },
                {
                  id: 'q5',
                  question: 'What happens when you access map[key] if key does not exist in the map?',
                  options: [
                    'Throws an OutOfBoundsException',
                    'Returns NULL and leaves the map unchanged',
                    'Default-constructs the value and inserts {key, 0} into the map',
                    'Causes a Segmentation Fault at runtime',
                  ],
                  correct_option_index: 2,
                  explanation: 'The operator[] inserts a default-initialized value for key if not present. Use map.count(key) or map.find(key) to check existence without insertion.',
                },
              ],
            },
          },
          {
            title: 'Number Theory for Competitive Programming',
            description: 'Comprehensive course covering Prime Sieve, Modular Arithmetic, Binary Exponentiation, Modular Inverse, Euler Totient Function, and GCD/LCM for Codeforces contests.',
            category: 'Mathematics',
            cover_color: '#4F46E5',
            cover_image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
            instructorId: instructorA ? instructorA.documentId || instructorA.id : null,
            lessons: [
              {
                title: 'Primality Testing & Sieve of Eratosthenes',
                content: '## Sieve of Eratosthenes (O(N log log N))\n\nPrecompute all prime numbers up to N = 10^7 within 0.1 seconds.',
                video_url: 'https://www.youtube.com/watch?v=S-p-U-u-q-b-7',
                order: 1,
              },
              {
                title: 'Smallest Prime Factor (SPF) & O(log N) Factorization',
                content: '## Fast Prime Factorization with SPF\n\nFactorize any number X <= 10^7 in O(log X) queries.',
                video_url: 'https://www.youtube.com/watch?v=S-p-U-u-q-b-7',
                order: 2,
              },
              {
                title: 'Modular Arithmetic & Binary Exponentiation (O(log P))',
                content: '## Modular Arithmetic & Fast Power',
                video_url: 'https://www.youtube.com/watch?v=E-u-J-z-t-z-K',
                order: 3,
              },
              {
                title: 'Modular Multiplicative Inverse & Fermat’s Little Theorem',
                content: '## Division under Modulo\n\nB^(-1) ≡ B^(M-2) (mod M)',
                video_url: 'https://www.youtube.com/watch?v=E-u-J-z-t-z-K',
                order: 4,
              },
              {
                title: 'Euler’s Totient Function phi(N) & Divisor Properties',
                content: '## Euler’s Totient Function phi(N)',
                video_url: 'https://www.youtube.com/watch?v=i-G-s-b-J-m-Z',
                order: 5,
              },
            ],
            quiz: {
              title: 'Number Theory & Modular Arithmetic Assessment',
              description: 'Evaluate your grasp of prime generation, modular inverse, fast exponentiation, and divisibility rules.',
              passing_score: 80,
              questions: [
                {
                  id: 'q1',
                  question: 'What is the asymptotic time complexity of the standard Sieve of Eratosthenes up to N?',
                  options: ['O(N log log N)', 'O(N log N)', 'O(N sqrt(N))', 'O(N^2)'],
                  correct_option_index: 0,
                  explanation: 'Sum of reciprocals of primes gives O(N log log N), running in milliseconds for N = 10^7.',
                },
                {
                  id: 'q2',
                  question: 'According to Fermat’s Little Theorem, what is the modular inverse of B modulo prime M?',
                  options: ['B^(M - 1) % M', 'B^(M - 2) % M', '1 / (B % M)', 'B^M % M'],
                  correct_option_index: 1,
                  explanation: 'Since B^(M-1) ≡ 1 (mod M), multiplying by B^(-1) gives B^(-1) ≡ B^(M-2) (mod M).',
                },
                {
                  id: 'q3',
                  question: 'What is the value of Euler’s Totient Function phi(13)?',
                  options: ['13', '12', '1', '6'],
                  correct_option_index: 1,
                  explanation: 'For any prime P, phi(P) = P - 1. Therefore, phi(13) = 12.',
                },
                {
                  id: 'q4',
                  question: 'How many iterations does Binary Exponentiation take to compute a^B?',
                  options: ['O(B)', 'O(log B)', 'O(sqrt(B))', 'O(1)'],
                  correct_option_index: 1,
                  explanation: 'Binary exponentiation halves the power at each bit step, running in O(log B) multiplications.',
                },
                {
                  id: 'q5',
                  question: 'If (A * B) % M is needed where A, B <= 10^9 and M = 10^9 + 7, why is (long long) cast necessary?',
                  options: [
                    'To prevent 32-bit integer overflow before modulo operation',
                    'Because C++ cannot compute modulo on normal 32-bit int',
                    'To speed up CPU clock cycles',
                    'Because 10^9 + 7 is a prime number',
                  ],
                  correct_option_index: 0,
                  explanation: 'A * B can reach 10^18 which exceeds 32-bit signed integer max (~2 * 10^9), causing integer overflow if not using 64-bit integers (long long).',
                },
              ],
            },
          },
          {
            title: 'Graph Theory & Tree Algorithms for Contests',
            description: 'Deep dive into BFS, DFS, Connected Components, 2D Grid Traversals, Bipartite Graphs, and Dijkstra Shortest Paths.',
            category: 'Algorithms',
            cover_color: '#16A34A',
            cover_image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
            instructorId: instructorA ? instructorA.documentId || instructorA.id : null,
            lessons: [
              {
                title: 'Graph Representation: Adjacency Lists vs. Matrices',
                content: '## Graph Representation',
                video_url: 'https://www.youtube.com/watch?v=J-p-h-0-Y-r-T',
                order: 1,
              },
              {
                title: 'Breadth First Search (BFS) & Shortest Paths in Unweighted Graphs',
                content: '## Breadth First Search (BFS)',
                video_url: 'https://www.youtube.com/watch?v=J-p-h-0-Y-r-T',
                order: 2,
              },
              {
                title: 'Depth First Search (DFS), Connected Components & Cycle Detection',
                content: '## Depth First Search (DFS)',
                video_url: 'https://www.youtube.com/watch?v=X-U-F-r-4-H-a',
                order: 3,
              },
              {
                title: '2D Grid Graph Traversal (Flood Fill & Knight Moves)',
                content: '## 2D Grid Representation',
                video_url: 'https://www.youtube.com/watch?v=X-U-F-r-4-H-a',
                order: 4,
              },
              {
                title: 'Bipartite Graph Checking using 2-Coloring',
                content: '## Bipartite Graphs',
                video_url: 'https://www.youtube.com/watch?v=K-5-1-4-8-I-u',
                order: 5,
              },
              {
                title: 'Dijkstra’s Algorithm for Weighted Shortest Paths',
                content: '## Dijkstra Algorithm (O((V + E) log V))',
                video_url: 'https://www.youtube.com/watch?v=K-5-1-4-8-I-u',
                order: 6,
              },
            ],
            quiz: {
              title: 'Graph Traversal & Shortest Path Assessment',
              description: 'Assess your skills in graph modeling, BFS/DFS properties, bipartite graph theory, and Dijkstra relaxation.',
              passing_score: 75,
              questions: [
                {
                  id: 'q1',
                  question: 'Which algorithm finds the shortest path in an unweighted graph in O(V + E) time?',
                  options: ['Breadth First Search (BFS)', 'Depth First Search (DFS)', 'Floyd-Warshall Algorithm', 'Kruskal Algorithm'],
                  correct_option_index: 0,
                  explanation: 'BFS explores level-by-level, guaranteeing the first time a node is reached is via the minimal number of edges.',
                },
                {
                  id: 'q2',
                  question: 'A graph is bipartite if and only if:',
                  options: ['It contains no odd cycles', 'It is a complete graph', 'It has more edges than vertices', 'All vertex degrees are even'],
                  correct_option_index: 0,
                  explanation: 'A graph can be 2-colored (bipartite) if and only if there are no odd-length cycles.',
                },
                {
                  id: 'q3',
                  question: 'Why does Dijkstra’s algorithm fail on graphs with negative edge weights?',
                  options: [
                    'Because it will throw a division by zero error',
                    'Because once a vertex distance is finalized, Dijkstra assumes no shorter path can be found, which negative edges violate',
                    'Because priority_queue cannot store negative numbers',
                    'Because it only works on trees',
                  ],
                  correct_option_index: 1,
                  explanation: 'Dijkstra greedily finalizes the minimum distance node. A negative edge later could create a shorter path, breaking greedy correctness. Use Bellman-Ford or SPFA instead.',
                },
                {
                  id: 'q4',
                  question: 'What is the time complexity of Dijkstra using a binary heap (std::priority_queue)?',
                  options: ['O((V + E) log V)', 'O(V^3)', 'O(V * E)', 'O(V + E)'],
                  correct_option_index: 0,
                  explanation: 'Each vertex is popped in O(log V) and each edge can trigger a heap push in O(log V), giving O((V + E) log V).',
                },
                {
                  id: 'q5',
                  question: 'In a tree with N vertices, exactly how many edges are there?',
                  options: ['N - 1', 'N', 'N + 1', 'N * (N - 1) / 2'],
                  correct_option_index: 0,
                  explanation: 'Every connected acyclic graph (tree) with N vertices contains exactly N - 1 edges.',
                },
              ],
            },
          },
          {
            title: 'Time Complexity, Two Pointers & Binary Search on Answer',
            description: 'Learn asymptotic analysis, 10^8 operations rule for 1.0s time limits, Two Pointers technique, and Binary Search on monotonic predicate functions.',
            category: 'Competitive Programming',
            cover_color: '#0891B2',
            cover_image_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80',
            instructorId: instructorA ? instructorA.documentId || instructorA.id : null,
            lessons: [
              {
                title: 'Asymptotic Analysis & The 10^8 Operations Rule',
                content: '## Rule of Thumb for Online Judges',
                video_url: 'https://www.youtube.com/watch?v=S-p-U-u-q-b-7',
                order: 1,
              },
              {
                title: 'Two Pointers Technique for Target Sums & Subarrays',
                content: '## Two Pointers',
                video_url: 'https://www.youtube.com/watch?v=S-p-U-u-q-b-7',
                order: 2,
              },
              {
                title: 'Binary Search on Monotonic Answer (Predicate Invariant)',
                content: '## Binary Search on Answer',
                video_url: 'https://www.youtube.com/watch?v=4-iH-Y4P-uU',
                order: 3,
              },
            ],
            quiz: {
              title: 'Complexity Analysis & Binary Search Assessment',
              description: 'Test your understanding of runtime constraints, two pointer movement, and monotonic answer spaces.',
              passing_score: 70,
              questions: [
                {
                  id: 'q1',
                  question: 'If an algorithm executes 2 * 10^8 operations on Codeforces with a 1.0s time limit, what is the expected verdict?',
                  options: ['Time Limit Exceeded (TLE) or Close to 1.0s', 'Accepted (0.01s)', 'Memory Limit Exceeded (MLE)', 'Wrong Answer'],
                  correct_option_index: 0,
                  explanation: '1.0s time limits roughly permit 10^8 operations. 2 * 10^8 basic operations is on the edge and usually risks TLE without fast I/O.',
                },
                {
                  id: 'q2',
                  question: 'What is the required property of function check(X) to apply Binary Search on Answer?',
                  options: ['Monotonicity (the truth values must be sorted: FFF...TTT or TTT...FFF)', 'Random distribution', 'Linear slope', 'Differentiability'],
                  correct_option_index: 0,
                  explanation: 'Binary search requires monotonicity so that eliminating one half guarantees the answer is in the remaining half.',
                },
                {
                  id: 'q3',
                  question: 'What is the time complexity of the Two Pointers technique on an array of size N?',
                  options: ['O(N)', 'O(N^2)', 'O(N log N)', 'O(1)'],
                  correct_option_index: 0,
                  explanation: 'Since each pointer advances at most N steps, the total operations across the entire loop are at most 2N = O(N).',
                },
              ],
            },
          },
          {
            title: 'Dynamic Programming Fundamentals for Problem Solving',
            description: 'Master recursion memoization, state-space transitions, 0/1 Knapsack variations, and space-optimized tabulation for contest problems.',
            category: 'Algorithms',
            cover_color: '#8B5CF6',
            cover_image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
            instructorId: instructorA ? instructorA.documentId || instructorA.id : null,
            lessons: [
              {
                title: 'Recursion, Overlapping Subproblems & Memoization',
                content: '## Dynamic Programming Foundations',
                video_url: 'https://www.youtube.com/watch?v=4-iH-Y4P-uU',
                order: 1,
              },
              {
                title: '0/1 Knapsack Problem & Space Optimization',
                content: '## 0/1 Knapsack',
                video_url: 'https://www.youtube.com/watch?v=E-u-J-z-t-z-K',
                order: 2,
              },
              {
                title: 'Longest Increasing Subsequence (LIS) in O(N log N)',
                content: '## LIS with Binary Search',
                video_url: 'https://www.youtube.com/watch?v=E-u-J-z-t-z-K',
                order: 3,
              },
            ],
            quiz: {
              title: 'Dynamic Programming States Assessment',
              description: 'Assess state formulation, transition definitions, and space complexity optimizations.',
              passing_score: 70,
              questions: [
                {
                  id: 'q1',
                  question: 'What two properties must a problem have to be solvable using Dynamic Programming?',
                  options: [
                    'Overlapping Subproblems & Optimal Substructure',
                    'Greedy Choice Property & Connected Components',
                    'Monotonicity & Prime Factorization',
                    'Linear Independence & Convexity',
                  ],
                  correct_option_index: 0,
                  explanation: 'DP applies when solutions to subproblems overlap and the global optimal solution can be built from optimal solutions to subproblems.',
                },
                {
                  id: 'q2',
                  question: 'Why do we iterate weights backwards in the 1D space-optimized 0/1 Knapsack array?',
                  options: [
                    'To prevent using the current item multiple times in the same step',
                    'To sort the items in ascending order of values',
                    'To avoid cache misses in the CPU L1 cache',
                    'Because backward loops run faster in C++',
                  ],
                  correct_option_index: 0,
                  explanation: 'Iterating backward ensures dp[w - weight[i]] references the previous row state rather than the current item being reused.',
                },
              ],
            },
          },
          {
            title: 'Disjoint Set Union (DSU) & Minimum Spanning Tree',
            description: 'Learn Union-Find with path compression and union by rank/size, cycle detection in undirected graphs, and Kruskal\'s MST algorithm.',
            category: 'Algorithms',
            cover_color: '#D97706',
            cover_image_url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
            instructorId: instructorA ? instructorA.documentId || instructorA.id : null,
            lessons: [
              {
                title: 'DSU Data Structure with Path Compression & Union by Size',
                content: '## Disjoint Set Union (DSU)\n\nNearly O(1) amortized operations using the inverse Ackermann function alpha(N).',
                video_url: 'https://www.youtube.com/watch?v=J-p-h-0-Y-r-T',
                order: 1,
              },
              {
                title: 'Kruskal’s Algorithm for Minimum Spanning Trees (MST)',
                content: '## Kruskal’s MST (O(E log E))',
                video_url: 'https://www.youtube.com/watch?v=J-p-h-0-Y-r-T',
                order: 2,
              },
            ],
            quiz: {
              title: 'DSU & Spanning Tree Assessment',
              description: 'Assess your understanding of disjoint sets, path compression invariants, and greedy tree construction.',
              passing_score: 75,
              questions: [
                {
                  id: 'q1',
                  question: 'What is the amortized time complexity per find/union operation in DSU with path compression and union by rank?',
                  options: ['O(alpha(N)) — almost O(1)', 'O(log N)', 'O(N)', 'O(N^2)'],
                  correct_option_index: 0,
                  explanation: 'Path compression combined with union by rank gives an amortized complexity bounded by the Inverse Ackermann function alpha(N) <= 4 for all practical N.',
                },
                {
                  id: 'q2',
                  question: 'How does Kruskal\'s algorithm determine whether adding an edge creates a cycle in the graph?',
                  options: [
                    'By checking if both endpoints belong to the same DSU set (find(u) == find(v))',
                    'By running a full BFS traversal',
                    'By comparing the vertex degrees',
                    'By checking if edge weight is negative',
                  ],
                  correct_option_index: 0,
                  explanation: 'If find(u) == find(v), u and v are already connected, so adding edge (u, v) creates a cycle.',
                },
              ],
            },
          },
          {
            title: 'Segment Tree & Range Query Algorithms',
            description: 'Master point updates, range sum/min/max queries in O(log N), lazy propagation for range updates, and tree segment arrays.',
            category: 'Data Structures',
            cover_color: '#EC4899',
            cover_image_url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
            instructorId: instructorA ? instructorA.documentId || instructorA.id : null,
            lessons: [
              {
                title: 'Segment Tree Architecture & Point Updates (O(log N))',
                content: '## Segment Tree Foundations\n\nBuild in O(N), query range [L, R] in O(log N), update single point in O(log N). Stored in 4 * N array size.',
                video_url: 'https://www.youtube.com/watch?v=kYV3u2o6L_E',
                order: 1,
              },
              {
                title: 'Lazy Propagation for Range Updates (O(log N))',
                content: '## Lazy Propagation',
                video_url: 'https://www.youtube.com/watch?v=kYV3u2o6L_E',
                order: 2,
              },
            ],
            quiz: {
              title: 'Segment Tree & Range Queries Assessment',
              description: 'Test your mastery in range trees, array size limits, and push-down lazy propagation.',
              passing_score: 75,
              questions: [
                {
                  id: 'q1',
                  question: 'What is the recommended size of the array storing a segment tree for an input array of size N?',
                  options: ['4 * N', '2 * N', 'N * log N', 'N^2'],
                  correct_option_index: 0,
                  explanation: 'A complete binary tree over N leaves can require up to 4 * N array elements to avoid out of bounds in index arithmetic.',
                },
                {
                  id: 'q2',
                  question: 'What is the time complexity of querying a range sum in a Segment Tree?',
                  options: ['O(log N)', 'O(1)', 'O(N)', 'O(N log N)'],
                  correct_option_index: 0,
                  explanation: 'At each level of the tree, at most 4 nodes are visited, giving O(log N) overall query time.',
                },
              ],
            },
          },
          {
            title: 'Bit Manipulation & XOR Problem Solving Tricks',
            description: 'Master bitwise AND/OR/XOR properties, popcount, iterating all submasks of a bitmask in O(3^N), and XOR basis.',
            category: 'Competitive Programming',
            cover_color: '#10B981',
            cover_image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
            instructorId: instructorA ? instructorA.documentId || instructorA.id : null,
            lessons: [
              {
                title: 'Bitwise Operations, Masks & Built-in GCC Functions',
                content: '## Fast Bitwise Tricks\n\n- `__builtin_popcountll(x)` — Count set bits\n- `(1LL << k)` — Set k-th bit\n- `x & (x - 1)` — Clear lowest set bit\n- `x & (-x)` — Extract lowest set bit (LSB)',
                video_url: 'https://www.youtube.com/watch?v=S-p-U-u-q-b-7',
                order: 1,
              },
              {
                title: 'Iterating All Submasks of a Mask in O(3^N)',
                content: '## Submask Enumeration',
                video_url: 'https://www.youtube.com/watch?v=S-p-U-u-q-b-7',
                order: 2,
              },
            ],
            quiz: {
              title: 'Bit Manipulation & Submasks Assessment',
              description: 'Assess low-level bit operations, XOR identity properties, and bitmask subset iteration.',
              passing_score: 70,
              questions: [
                {
                  id: 'q1',
                  question: 'What is the value of X ^ X for any integer X?',
                  options: ['0', 'X', '1', '2 * X'],
                  correct_option_index: 0,
                  explanation: 'XOR of any number with itself is always 0.',
                },
                {
                  id: 'q2',
                  question: 'What operation isolates the lowest set bit (least significant 1) of integer X in two\'s complement?',
                  options: ['X & (-X)', 'X | (X - 1)', 'X ^ (X + 1)', '~X'],
                  correct_option_index: 0,
                  explanation: 'In two\'s complement, -X = ~X + 1. Therefore, X & (-X) isolates the lowest set bit.',
                },
              ],
            },
          },
          {
            title: 'String Algorithms & Polynomial Rolling Hash',
            description: 'Master single & double polynomial hashing to prevent contest test collisions, string matching in O(N), and prefix functions (KMP).',
            category: 'Algorithms',
            cover_color: '#7C3AED',
            cover_image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
            instructorId: instructorA ? instructorA.documentId || instructorA.id : null,
            lessons: [
              {
                title: 'Polynomial Rolling Hash & Double Hashing Techniques',
                content: '## String Hashing\n\nCompute hash of substring s[L...R] in O(1) time after O(N) precomputation.\n\nUse double hashing with bases (313, 317) and moduli (10^9 + 7, 10^9 + 9) to eliminate anti-hash hacks on Codeforces.',
                video_url: 'https://www.youtube.com/watch?v=4-iH-Y4P-uU',
                order: 1,
              },
              {
                title: 'Knuth-Morris-Pratt (KMP) & Longest Prefix Suffix (LPS)',
                content: '## KMP Prefix Function',
                video_url: 'https://www.youtube.com/watch?v=4-iH-Y4P-uU',
                order: 2,
              },
            ],
            quiz: {
              title: 'String Processing & Hashing Assessment',
              description: 'Test string prefix invariants, collision prevention, and substring query mechanics.',
              passing_score: 75,
              questions: [
                {
                  id: 'q1',
                  question: 'What is the time complexity to compute the hash of any substring s[L...R] after O(N) prefix hash precomputation?',
                  options: ['O(1)', 'O(R - L)', 'O(log N)', 'O(N)'],
                  correct_option_index: 0,
                  explanation: 'With precomputed powers and prefix hashes, substring hash is computed in O(1) via arithmetic subtraction and modular multiplication.',
                },
                {
                  id: 'q2',
                  question: 'Why is Double Hashing (two distinct primes P1, P2 and moduli M1, M2) recommended on Codeforces?',
                  options: [
                    'To reduce collision probability to ~1 / (M1 * M2) ≈ 10^-18, making anti-hash hacks virtually impossible',
                    'Because single hashing takes O(N^2) time',
                    'Because C++ requires pairs for strings',
                    'To enable lowercase and uppercase separation',
                  ],
                  correct_option_index: 0,
                  explanation: 'Double hashing with two 10^9 primes squares the state space to 10^18, making adversarial collision generation mathematically infeasible within contest limits.',
                },
              ],
            },
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
                },
              });
              strapi.log.info(`[SEED] Enrolled student into "${(firstCourse as any).title}"`);
            }

            // Ensure progress
            const courseLessons = await strapi.db.query('api::lesson.lesson').findMany({
              where: { course: firstCourse.id },
              orderBy: { order: 'asc' },
            });

            if (courseLessons && courseLessons.length > 0) {
              const firstLesson = courseLessons[0];
              const existingProgress = await strapi.db
                .query('api::progress.progress')
                .findOne({
                  where: {
                    student: studentDemo.id,
                    lesson: firstLesson.id,
                  },
                });

              if (!existingProgress) {
                await strapi.documents('api::progress.progress').create({
                  data: {
                    student: (studentDemo as any).documentId || studentDemo.id,
                    course: (firstCourse as any).documentId || firstCourse.id,
                    lesson: (firstLesson as any).documentId || firstLesson.id,
                    completed_at: new Date().toISOString(),
                  },
                });
                strapi.log.info(`[SEED] Recorded progress for student on lesson "${firstLesson.title}"`);
              }
            }
          }
        }

        // 6. Seed Competitive Programming Blog Posts
        const ALL_BLOG_POSTS = [
          {
            title: 'Roadmap to Candidate Master on Codeforces: Problem Solving & Mindset',
            slug: 'roadmap-to-candidate-master-codeforces',
            excerpt: 'A comprehensive guide on topic progression, rating milestones, virtual contests, and building speed on Codeforces Div. 2 and Div. 3 contests.',
            content: `## The Journey to Candidate Master (1900+ Rating)\n\nBecoming a Candidate Master on Codeforces requires mastering the fundamentals of algorithms, data structures, and mental discipline during live contests.\n\n### 1. The Rating Milestones\n- **Pupil (1200 - 1399)**: Master C++ STL (Vector, Map, Set, Priority Queue) and basic implementation.\n- **Specialist (1400 - 1599)**: Binary Search on Answer, Two Pointers, Number Theory (Sieve, Modulo, GCD), BFS/DFS.\n- **Expert (1600 - 1899)**: Dynamic Programming (1D/2D, Knapsack, Trees), Segment Trees, Combinatorics, and Disjoint Set Union (DSU).\n\n### 2. Virtual Contests & Upsolving\nNever leave a contest without upsolving at least one problem above your current comfort zone.`,
            cover_image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
            is_published: true,
            published_date: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            title: 'Mastering Fast I/O and Standard ICPC C++ Codebook Templates',
            slug: 'mastering-fast-io-icpc-codebook-templates',
            excerpt: 'How standard C++ template macros, cin.tie(NULL), and codebook organization shave critical seconds off contest submissions.',
            content: `## Fast I/O in Competitive Programming\n\nIn C++, \`std::cin\` and \`std::cout\` synchronize with C standard streams (\`scanf\`/\`printf\`) by default, introducing significant overhead.\n\n### The Standard CP Template\n\`\`\`cpp\n#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solve() {\n    // Contest solution\n}\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    \n    int tc = 1;\n    cin >> tc;\n    while (tc--) solve();\n    return 0;\n}\n\`\`\`\n\nDisabling synchronization allows reading $10^6$ integers in under 0.08 seconds!`,
            cover_image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
            is_published: true,
            published_date: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            title: 'Understanding the 10^8 Operations Limit in Online Judges',
            slug: 'understanding-10-to-8-operations-limit-online-judges',
            excerpt: 'Avoid Time Limit Exceeded (TLE) by mapping problem constraints directly to asymptotic algorithm complexities.',
            content: `## The Golden 1-Second Rule\n\nModern contest servers (Intel Xeon processors running on Linux) execute approximately $10^8$ basic instructions per second.\n\n### Complexity Quick Reference\n- $N \\le 10^6$: $O(N)$ or $O(N \\log N)$\n- $N \\le 2000$: $O(N^2)$ (Matrix chains, pairs check)\n- $N \\le 500$: $O(N^3)$ (Floyd-Warshall, Matrix Multiplication)\n- $N \\le 20$: $O(2^N \\times N)$ (Bitmask Dynamic Programming)`,
            cover_image_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&auto=format&fit=crop&q=80',
            is_published: true,
            published_date: new Date(Date.now() - 259200000).toISOString(),
          },
          {
            title: 'Prime Factorization in O(log N) using Smallest Prime Factor (SPF)',
            slug: 'prime-factorization-spf-log-n',
            excerpt: 'How precomputing SPF arrays speeds up multiple query factorizations during Codeforces number theory problems.',
            content: `## Beyond Trial Division\n\nTrial division takes $O(\\sqrt{N})$ per query. With SPF precomputation via Sieve in $O(M \\log \\log M)$, any $X \\le M$ is factorized in $O(\\log X)$ steps!`,
            cover_image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&auto=format&fit=crop&q=80',
            is_published: true,
            published_date: new Date(Date.now() - 345600000).toISOString(),
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
