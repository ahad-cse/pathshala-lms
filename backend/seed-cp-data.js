/**
 * Standalone Competitive Programming Data Seeder for PathShala LMS
 * Sourced from CPS Academy Curriculum (STL, Number Theory, Graphs, DP, Complexity)
 */

const { createStrapi } = require('@strapi/strapi');

async function seedCPData() {
  console.log('🚀 Initializing Strapi instance to seed Competitive Programming data...');
  const appContext = await createStrapi().load();

  try {
    const strapi = appContext;

    // 1. Fetch Key Users
    const instructor = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { email: 'instructor@pathshala.edu' },
    });
    const coInstructor = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { email: 'content_mgr@pathshala.edu' },
    });
    const student = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { email: 'student@pathshala.edu' },
    });
    const admin = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { email: 'admin@pathshala.edu' },
    });

    if (!instructor || !student) {
      console.error('❌ Required users not found. Run Strapi once to bootstrap default users.');
      process.exit(1);
    }

    console.log('🧹 Cleaning old course submissions, progress, enrollments, quizzes, lessons & courses...');

    // Delete existing submissions, progress, enrollments
    await strapi.db.query('api::quiz-submission.quiz-submission').deleteMany({});
    await strapi.db.query('api::progress.progress').deleteMany({});
    await strapi.db.query('api::enrollment.enrollment').deleteMany({});
    await strapi.db.query('api::quiz.quiz').deleteMany({});
    await strapi.db.query('api::lesson.lesson').deleteMany({});
    await strapi.db.query('api::course.course').deleteMany({});
    await strapi.db.query('api::blog-post.blog-post').deleteMany({});

    console.log('✨ Cleaned existing database entries. Now creating CPS Academy Competitive Programming Curricula...');

    const CP_COURSES = [
      {
        title: 'C++ STL Mastery for Competitive Programming',
        slug: 'cpp-stl-mastery-competitive-programming',
        description: 'Master Standard Template Library (STL) containers, iterators, custom comparators, and algorithms specifically tailored for Codeforces, AtCoder, and ICPC contests.',
        category: 'Competitive Programming',
        level: 'beginner',
        is_published: true,
        thumbnail_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
        lessons: [
          {
            title: 'Introduction to C++ STL Vector & Dynamic Arrays',
            slug: 'intro-cpp-stl-vector-dynamic-arrays',
            video_url: 'https://www.youtube.com/watch?v=kYV3u2o6L_E',
            content: '## C++ STL Vector Fundamentals\n\nVectors are dynamic contiguous arrays with automatic resizing capabilities.\n\n### Key Operations\n- `vector<int> v;` — Declaration\n- `v.push_back(val);` — Amortized $O(1)$ insertion\n- `v.pop_back();` — $O(1)$ deletion from back\n- `v.size()`, `v.empty()`, `v.clear()`\n\n### Complexity & Memory Reallocation\nWhen vector capacity is exceeded, it reallocates memory (usually $2\\times$). Reserve memory beforehand with `v.reserve(N)` for optimal speed in time-critical contests.',
            order: 1,
            is_published: true,
          },
          {
            title: 'STL Pair, Vector of Pairs & Sorting Techniques',
            slug: 'stl-pair-vector-of-pairs-sorting',
            video_url: 'https://www.youtube.com/watch?v=kYV3u2o6L_E',
            content: '## Pair & Vector of Pairs\n\n`std::pair<T1, T2>` allows bundling two heterogeneous values.\n\n### Example\n```cpp\nvector<pair<int, int>> points;\npoints.push_back({x, y});\nsort(points.begin(), points.end()); // Sorts primarily by .first, secondarily by .second\n```\n\nIdeal for coordinate compression, interval scheduling, and weighted edge lists.',
            order: 2,
            is_published: true,
          },
          {
            title: 'C++ STL String Manipulation & Fast Parsing',
            slug: 'cpp-stl-string-manipulation-fast-parsing',
            video_url: 'https://www.youtube.com/watch?v=4-iH-Y4P-uU',
            content: '## String Processing in CP\n\n- `string s; getline(cin, s);`\n- `s.substr(pos, len)` — Extract substring in $O(len)$\n- `reverse(s.begin(), s.end())`\n- `to_string(num)`, `stoi(s)`\n\nAvoid repeated string concatenation in loops with `+` inside $O(N)$ routines; use `push_back()` or `+=` to avoid $O(N^2)$ copying.',
            order: 3,
            is_published: true,
          },
          {
            title: 'STL Map vs. Unordered Map & Frequency Counting',
            slug: 'stl-map-unordered-map-frequency-counting',
            video_url: 'https://www.youtube.com/watch?v=4-iH-Y4P-uU',
            content: '## Map (`std::map`) vs Unordered Map (`std::unordered_map`)\n\n| Feature | `std::map` | `std::unordered_map` |\n|---|---|---|\n| Underlying Data Structure | Red-Black Tree (Self-Balancing BST) | Hash Table with Buckets |\n| Lookup / Insertion Time | $O(\\log N)$ guaranteed | $O(1)$ average, $O(N)$ worst-case |\n| Order of Keys | Strict Sorted Order | Arbitrary (Unordered) |\n\n> **Contest Warning**: `unordered_map` on Codeforces can be hacked to $O(N^2)$ using custom hash collision tests. Use custom anti-hash structs or stick with `std::map` for safe $O(\\log N)$ lookups.',
            order: 4,
            is_published: true,
          },
          {
            title: 'STL Set, Multiset & Order Tracking',
            slug: 'stl-set-multiset-order-tracking',
            video_url: 'https://www.youtube.com/watch?v=O-U-D-K-q-A',
            content: '## Sets & Multisets\n\n- `std::set<int>`: Maintains unique sorted elements in $O(\\log N)$.\n- `std::multiset<int>`: Allows duplicates.\n\n### Important Multiset Pitfall\n- `ms.erase(val);` — Removes **ALL** occurrences of `val`!\n- `ms.erase(ms.find(val));` — Erases only **ONE** occurrence of `val` by iterator.',
            order: 5,
            is_published: true,
          },
          {
            title: 'Priority Queue (Min-Heap / Max-Heap) & Greedy Strategies',
            slug: 'priority-queue-heaps-greedy-strategies',
            video_url: 'https://www.youtube.com/watch?v=O-U-D-K-q-A',
            content: '## Priority Queue\n\n- Max-Heap (Default): `priority_queue<int> pq;`\n- Min-Heap: `priority_queue<int, vector<int>, greater<int>> min_pq;`\n\nOffers $O(\\log N)$ insertion (`push`), $O(1)$ top lookup (`top()`), and $O(\\log N)$ removal (`pop()`). Essential for Dijkstra and Huffman Coding.',
            order: 6,
            is_published: true,
          },
        ],
        quiz: {
          title: 'C++ STL & Asymptotic Efficiency Assessment',
          description: 'Comprehensive multiple-choice assessment on C++ STL time complexities, corner cases, and anti-hash strategies.',
          passing_score: 70,
          is_published: true,
          questions: [
            {
              question: 'What is the time complexity of inserting N elements into a std::map<int, int>?',
              options: ['O(N)', 'O(N log N)', 'O(1)', 'O(N^2)'],
              correct_option_index: 1,
              explanation: 'Each insertion in a std::map takes O(log K) where K is the current size. Inserting N elements takes O(N log N) total time.',
            },
            {
              question: 'In std::multiset<int> ms, which operation erases exactly one instance of integer x?',
              options: ['ms.erase(x);', 'ms.erase(ms.find(x));', 'ms.remove_one(x);', 'ms.pop(x);'],
              correct_option_index: 1,
              explanation: 'ms.erase(x) erases all occurrences of x. To erase a single instance, pass the iterator: ms.erase(ms.find(x)).',
            },
            {
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
        slug: 'number-theory-competitive-programming',
        description: 'Comprehensive course covering Prime Sieve, Modular Arithmetic, Binary Exponentiation, Modular Inverse, Euler Totient Function, and GCD/LCM for Codeforces contests.',
        category: 'Mathematics',
        level: 'intermediate',
        is_published: true,
        thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&auto=format&fit=crop&q=80',
        lessons: [
          {
            title: 'Primality Testing & Sieve of Eratosthenes',
            slug: 'primality-testing-sieve-of-eratosthenes',
            video_url: 'https://www.youtube.com/watch?v=S-p-U-u-q-b-7',
            content: '## Sieve of Eratosthenes ($O(N \\log \\log N)$)\n\nPrecompute all prime numbers up to $N = 10^7$ within 0.1 seconds.\n\n```cpp\nconst int MAXN = 1e7 + 5;\nvector<bool> is_prime(MAXN, true);\nis_prime[0] = is_prime[1] = false;\n\nvoid sieve() {\n    for (int p = 2; p * p < MAXN; p++) {\n        if (is_prime[p]) {\n            for (int i = p * p; i < MAXN; i += p)\n                is_prime[i] = false;\n        }\n    }\n}\n```',
            order: 1,
            is_published: true,
          },
          {
            title: 'Smallest Prime Factor (SPF) & O(log N) Factorization',
            slug: 'smallest-prime-factor-spf-fast-factorization',
            video_url: 'https://www.youtube.com/watch?v=S-p-U-u-q-b-7',
            content: '## Fast Prime Factorization with SPF\n\nBy storing the smallest prime factor for each integer up to $10^7$, any number $X \\le 10^7$ can be factorized in $O(\\log X)$ queries during live contests.',
            order: 2,
            is_published: true,
          },
          {
            title: 'Modular Arithmetic & Binary Exponentiation (O(log P))',
            slug: 'modular-arithmetic-binary-exponentiation',
            video_url: 'https://www.youtube.com/watch?v=E-u-J-z-t-z-K',
            content: '## Modular Arithmetic & Fast Power\n\nIn competitive programming, answers are frequently required modulo $M = 10^9 + 7$ or $998244353$.\n\n```cpp\nlong long binpow(long long a, long long b, long long m = 1e9 + 7) {\n    long long res = 1;\n    a %= m;\n    while (b > 0) {\n        if (b & 1) res = (res * a) % m;\n        a = (a * a) % m;\n        b >>= 1;\n    }\n    return res;\n}\n```',
            order: 3,
            is_published: true,
          },
          {
            title: 'Modular Multiplicative Inverse & Fermat’s Little Theorem',
            slug: 'modular-multiplicative-inverse-fermats-theorem',
            video_url: 'https://www.youtube.com/watch?v=E-u-J-z-t-z-K',
            content: '## Division under Modulo\n\nDivision $\\frac{A}{B} \\pmod M$ is computed as $A \\times B^{-1} \\pmod M$.\n\nBy Fermat’s Little Theorem, when $M$ is prime:\n$$B^{M-1} \\equiv 1 \\pmod M \\implies B^{-1} \\equiv B^{M-2} \\pmod M$$\n\nThus, $B^{-1} = \\text{binpow}(B, M - 2, M)$.',
            order: 4,
            is_published: true,
          },
          {
            title: 'Euler’s Totient Function phi(N) & Divisor Properties',
            slug: 'eulers-totient-function-phi-divisor-properties',
            video_url: 'https://www.youtube.com/watch?v=i-G-s-b-J-m-Z',
            content: '## Euler’s Totient Function $\\phi(N)$\n\nCounts the number of integers $1 \\le k \\le N$ coprime to $N$.\n\n$$\\phi(N) = N \\prod_{p | N} \\left(1 - \\frac{1}{p}\\right)$$\n\nUseful in Euler’s Theorem: $a^{\\phi(m)} \\equiv 1 \\pmod m$ for $\\gcd(a, m) = 1$.',
            order: 5,
            is_published: true,
          },
        ],
        quiz: {
          title: 'Number Theory & Modular Arithmetic Assessment',
          description: 'Evaluate your grasp of prime generation, modular inverse, fast exponentiation, and divisibility rules.',
          passing_score: 80,
          is_published: true,
          questions: [
            {
              question: 'What is the asymptotic time complexity of the standard Sieve of Eratosthenes up to N?',
              options: ['O(N log log N)', 'O(N log N)', 'O(N sqrt(N))', 'O(N^2)'],
              correct_option_index: 0,
              explanation: 'Sum of reciprocals of primes gives O(N log log N), running in milliseconds for N = 10^7.',
            },
            {
              question: 'According to Fermat’s Little Theorem, what is the modular inverse of B modulo prime M?',
              options: ['B^(M - 1) % M', 'B^(M - 2) % M', '1 / (B % M)', 'B^M % M'],
              correct_option_index: 1,
              explanation: 'Since B^(M-1) ≡ 1 (mod M), multiplying by B^(-1) gives B^(-1) ≡ B^(M-2) (mod M).',
            },
            {
              question: 'What is the value of Euler’s Totient Function phi(13)?',
              options: ['13', '12', '1', '6'],
              correct_option_index: 1,
              explanation: 'For any prime P, phi(P) = P - 1. Therefore, phi(13) = 12.',
            },
            {
              question: 'How many iterations does Binary Exponentiation take to compute a^B?',
              options: ['O(B)', 'O(log B)', 'O(sqrt(B))', 'O(1)'],
              correct_option_index: 1,
              explanation: 'Binary exponentiation halves the power at each bit step, running in O(log B) multiplications.',
            },
            {
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
        slug: 'graph-theory-tree-algorithms-contests',
        description: 'Deep dive into BFS, DFS, Connected Components, 2D Grid Traversals, Bipartite Graphs, and Dijkstra Shortest Paths.',
        category: 'Algorithms',
        level: 'intermediate',
        is_published: true,
        thumbnail_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
        lessons: [
          {
            title: 'Graph Representation: Adjacency Lists vs. Matrices',
            slug: 'graph-representation-adjacency-lists-matrices',
            video_url: 'https://www.youtube.com/watch?v=J-p-h-0-Y-r-T',
            content: '## Graph Representation\n\n- Adjacency List: `vector<int> adj[N];` — Space $O(V + E)$. Default choice in competitive programming.\n- Weighted Graph: `vector<pair<int, int>> adj[N];` where `{neighbor, weight}`.',
            order: 1,
            is_published: true,
          },
          {
            title: 'Breadth First Search (BFS) & Shortest Paths in Unweighted Graphs',
            slug: 'bfs-shortest-path-unweighted-graphs',
            video_url: 'https://www.youtube.com/watch?v=J-p-h-0-Y-r-T',
            content: '## Breadth First Search (BFS)\n\nBFS explores vertices level by level using a queue.\n\n### Key Property\nBFS always finds the shortest path (minimum edge count) in unweighted graphs in $O(V + E)$ time.',
            order: 2,
            is_published: true,
          },
          {
            title: 'Depth First Search (DFS), Connected Components & Cycle Detection',
            slug: 'dfs-connected-components-cycle-detection',
            video_url: 'https://www.youtube.com/watch?v=X-U-F-r-4-H-a',
            content: '## Depth First Search (DFS)\n\nRecursive graph traversal ideal for component counting, tree diameter, topological sorting, and back-edge cycle detection.',
            order: 3,
            is_published: true,
          },
          {
            title: '2D Grid Graph Traversal (Flood Fill & Knight Moves)',
            slug: '2d-grid-graph-traversal-flood-fill',
            video_url: 'https://www.youtube.com/watch?v=X-U-F-r-4-H-a',
            content: '## 2D Grid Representation\n\nDirections array pattern:\n```cpp\nint dx[] = {-1, 1, 0, 0};\nint dy[] = {0, 0, -1, 1};\n```\nBoundary condition check `0 <= nx < R && 0 <= ny < C && !visited[nx][ny]`.',
            order: 4,
            is_published: true,
          },
          {
            title: 'Bipartite Graph Checking using 2-Coloring',
            slug: 'bipartite-graph-checking-2-coloring',
            video_url: 'https://www.youtube.com/watch?v=K-5-1-4-8-I-u',
            content: '## Bipartite Graphs\n\nA graph is bipartite if and only if it contains **no odd cycles**. Verified via 2-color BFS/DFS in $O(V + E)$.',
            order: 5,
            is_published: true,
          },
          {
            title: 'Dijkstra’s Algorithm for Weighted Shortest Paths',
            slug: 'dijkstras-algorithm-weighted-shortest-paths',
            video_url: 'https://www.youtube.com/watch?v=K-5-1-4-8-I-u',
            content: '## Dijkstra Algorithm ($O((V + E) \\log V)$)\n\nFinds single-source shortest paths on non-negative weighted graphs using a Min-Heap priority queue.',
            order: 6,
            is_published: true,
          },
        ],
        quiz: {
          title: 'Graph Traversal & Shortest Path Assessment',
          description: 'Assess your skills in graph modeling, BFS/DFS properties, bipartite graph theory, and Dijkstra relaxation.',
          passing_score: 75,
          is_published: true,
          questions: [
            {
              question: 'Which algorithm finds the shortest path in an unweighted graph in O(V + E) time?',
              options: ['Breadth First Search (BFS)', 'Depth First Search (DFS)', 'Floyd-Warshall Algorithm', 'Kruskal Algorithm'],
              correct_option_index: 0,
              explanation: 'BFS explores level-by-level, guaranteeing the first time a node is reached is via the minimal number of edges.',
            },
            {
              question: 'A graph is bipartite if and only if:',
              options: ['It contains no odd cycles', 'It is a complete graph', 'It has more edges than vertices', 'All vertex degrees are even'],
              correct_option_index: 0,
              explanation: 'A graph can be 2-colored (bipartite) if and only if there are no odd-length cycles.',
            },
            {
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
              question: 'What is the time complexity of Dijkstra using a binary heap (std::priority_queue)?',
              options: ['O((V + E) log V)', 'O(V^3)', 'O(V * E)', 'O(V + E)'],
              correct_option_index: 0,
              explanation: 'Each vertex is popped in O(log V) and each edge can trigger a heap push in O(log V), giving O((V + E) log V).',
            },
            {
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
        slug: 'time-complexity-two-pointers-binary-search',
        description: 'Learn asymptotic analysis, 10^8 operations rule for 1.0s time limits, Two Pointers technique, and Binary Search on monotonic predicate functions.',
        category: 'Competitive Programming',
        level: 'beginner',
        is_published: true,
        thumbnail_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&auto=format&fit=crop&q=80',
        lessons: [
          {
            title: 'Asymptotic Analysis & The 10^8 Operations Rule',
            slug: 'asymptotic-analysis-10-to-8-operations-rule',
            video_url: 'https://www.youtube.com/watch?v=S-p-U-u-q-b-7',
            content: '## Rule of Thumb for Online Judges\n\nMost online judges (Codeforces, AtCoder) allow $\\approx 10^8$ basic CPU operations per 1.0 second.\n\n- $N \\le 10^8$: $O(N)$\n- $N \\le 10^5$: $O(N \\log N)$\n- $N \\le 2000$: $O(N^2)$\n- $N \\le 500$: $O(N^3)$\n- $N \\le 20$: $O(2^N)$ or $O(N!)$',
            order: 1,
            is_published: true,
          },
          {
            title: 'Two Pointers Technique for Target Sums & Subarrays',
            slug: 'two-pointers-technique-target-sums-subarrays',
            video_url: 'https://www.youtube.com/watch?v=S-p-U-u-q-b-7',
            content: '## Two Pointers\n\nConvert $O(N^2)$ brute-force interval checks into linear $O(N)$ scans using left and right pointers moving monotonically.',
            order: 2,
            is_published: true,
          },
          {
            title: 'Binary Search on Monotonic Answer (Predicate Invariant)',
            slug: 'binary-search-on-monotonic-answer-predicate',
            video_url: 'https://www.youtube.com/watch?v=4-iH-Y4P-uU',
            content: '## Binary Search on Answer\n\nWhen a problem asks for "Minimize the Maximum" or "Maximize the Minimum", and the feasibility check `check(X)` is monotonic (e.g., `FFFFFTTTTT`), binary search finds the optimal $X$ in $O(\\log(\\text{range}) \\times \\text{check})$.',
            order: 3,
            is_published: true,
          },
        ],
        quiz: {
          title: 'Complexity Analysis & Binary Search Assessment',
          description: 'Test your understanding of runtime constraints, two pointer movement, and monotonic answer spaces.',
          passing_score: 70,
          is_published: true,
          questions: [
            {
              question: 'If an algorithm executes 2 * 10^8 operations on Codeforces with a 1.0s time limit, what is the expected verdict?',
              options: ['Time Limit Exceeded (TLE) or Close to 1.0s', 'Accepted (0.01s)', 'Memory Limit Exceeded (MLE)', 'Wrong Answer'],
              correct_option_index: 0,
              explanation: '1.0s time limits roughly permit 10^8 operations. 2 * 10^8 basic operations is on the edge and usually risks TLE without fast I/O.',
            },
            {
              question: 'What is the required property of function check(X) to apply Binary Search on Answer?',
              options: ['Monotonicity (the truth values must be sorted: FFF...TTT or TTT...FFF)', 'Random distribution', 'Linear slope', 'Differentiability'],
              correct_option_index: 0,
              explanation: 'Binary search requires monotonicity so that eliminating one half guarantees the answer is in the remaining half.',
            },
            {
              question: 'What is the time complexity of the Two Pointers technique on an array of size N?',
              options: ['O(N)', 'O(N^2)', 'O(N log N)', 'O(1)'],
              correct_option_index: 0,
              explanation: 'Since each pointer advances at most N steps, the total operations across the entire loop are at most 2N = O(N).',
            },
          ],
        },
      },
    ];

    // Create Courses, Lessons, Quizzes in Strapi
    for (const cData of CP_COURSES) {
      console.log(`📘 Creating Course: "${cData.title}"...`);

      const course = await strapi.documents('api::course.course').create({
        data: {
          title: cData.title,
          slug: cData.slug,
          description: cData.description,
          category: cData.category,
          level: cData.level,
          is_published: cData.is_published,
          thumbnail_url: cData.thumbnail_url,
          instructor: instructor.documentId || instructor.id,
          co_instructors: [coInstructor.documentId || coInstructor.id],
        },
      });

      const courseDocId = course.documentId;

      // Create Lessons
      for (const lData of cData.lessons) {
        await strapi.documents('api::lesson.lesson').create({
          data: {
            title: lData.title,
            slug: lData.slug,
            content: lData.content,
            video_url: lData.video_url,
            order: lData.order,
            is_published: lData.is_published,
            course: courseDocId,
          },
        });
      }
      console.log(`   ✓ Created ${cData.lessons.length} video lessons for "${cData.title}"`);

      // Create Quiz
      if (cData.quiz) {
        await strapi.documents('api::quiz.quiz').create({
          data: {
            title: cData.quiz.title,
            description: cData.quiz.description,
            passing_score: cData.quiz.passing_score,
            is_published: cData.quiz.is_published,
            questions: cData.quiz.questions,
            course: courseDocId,
          },
        });
        console.log(`   ✓ Created Quiz "${cData.quiz.title}" with ${cData.quiz.questions.length} questions`);
      }

      // Auto-enroll the demo student into Course 1 (STL Mastery) with 2 lessons completed
      if (cData.slug === 'cpp-stl-mastery-competitive-programming') {
        const studentDocId = student.documentId || student.id;

        // Enrollment
        await strapi.documents('api::enrollment.enrollment').create({
          data: {
            student: studentDocId,
            course: courseDocId,
            enrolled_at: new Date().toISOString(),
          },
        });

        // Find created lessons for progress
        const lessons = await strapi.db.query('api::lesson.lesson').findMany({
          where: { course: { id: course.id } },
        });

        if (lessons.length >= 2) {
          await strapi.documents('api::progress.progress').create({
            data: {
              student: studentDocId,
              lesson: lessons[0].documentId || lessons[0].id,
              course: courseDocId,
              completed: true,
              completed_at: new Date().toISOString(),
            },
          });

          await strapi.documents('api::progress.progress').create({
            data: {
              student: studentDocId,
              lesson: lessons[1].documentId || lessons[1].id,
              course: courseDocId,
              completed: true,
              completed_at: new Date().toISOString(),
            },
          });
        }
        console.log(`   ✓ Enrolled demo student in "${cData.title}" with active progress!`);
      }
    }

    // 4. Seed Competitive Programming Blog Posts
    console.log('📰 Seeding Competitive Programming Blog Posts...');
    const CP_BLOGS = [
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
    ];

    const contentMgrDocId = coInstructor.documentId || coInstructor.id;
    for (const bData of CP_BLOGS) {
      await strapi.documents('api::blog-post.blog-post').create({
        data: {
          ...bData,
          author: contentMgrDocId,
        },
      });
      console.log(`   ✓ Created CP Blog: "${bData.title}"`);
    }

    console.log('🎉 Successfully seeded entire database with CPS Academy Competitive Programming Curricula!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during CP database seeding:', err);
    process.exit(1);
  }
}

seedCPData();
