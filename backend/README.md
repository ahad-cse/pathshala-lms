# PathShala LMS — Backend Engine & Headless CMS

[![Strapi](https://img.shields.io/badge/Strapi-v5.52.1-purple?style=flat&logo=strapi)](https://strapi.io/)
[![Node.js](https://img.shields.io/badge/Node.js-v20%20%2F%20v22-green?style=flat&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Swagger](https://img.shields.io/badge/API%20Docs-OpenAPI%20%2F%20Swagger-85EA2D?style=flat&logo=swagger)](https://swagger.io/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20SQLite-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Deployment](https://img.shields.io/badge/Hosted%20on-Railway-success?style=flat)](https://railway.app)

> The backend core for **PathShala LMS**, developed using **Strapi v5 (TypeScript)**. It exposes secure REST endpoints, enforces 4-tier role-based access control (RBAC), manages persistent learning progress, executes server-side MCQ quiz grading, isolates unpublished blog drafts at the database level, and provides auto-generated OpenAPI 3.0 Swagger documentation.

---

## Live Endpoints & Console

- **Base REST API:** [https://pathshala-lms-production.up.railway.app](https://pathshala-lms-production.up.railway.app)
- **Interactive Swagger Documentation:** [https://pathshala-lms-production.up.railway.app/documentation/v1.0.0](https://pathshala-lms-production.up.railway.app/documentation/v1.0.0)
- **Strapi Admin Console:** [https://pathshala-lms-production.up.railway.app/admin](https://pathshala-lms-production.up.railway.app/admin)
- **Courses Endpoint:** `GET /api/courses`
- **Blog Posts Endpoint:** `GET /api/blog-posts`

---

## Interactive API Documentation (OpenAPI 3.0 / Swagger UI)

The backend integrates `@strapi/plugin-documentation` to automatically generate and serve OpenAPI 3.0 specifications:
- **Interactive Swagger UI:** Visit `/documentation/v1.0.0` in your browser to inspect all request schemas, response models, query parameters, and JWT authorization headers.
- **Admin Panel Access:** A dedicated **Documentation** panel is accessible directly from the Strapi Admin sidebar.

---

## Custom API Controllers & Security Policies

### 1. Admin Dashboard Controller (`api::admin-dashboard`)

#### `GET /api/admin-dashboard/stats`
- **Purpose:** Aggregates real-time platform metrics across all core entities.
- **Access:** Restricted to `admin` role (non-admins receive `403 Forbidden`).
- **Response Payload:**
  ```json
  {
    "data": {
      "totalUsers": 12,
      "usersByRole": { "admin": 1, "content_manager": 2, "instructor": 3, "student": 6 },
      "totalCourses": 4,
      "totalEnrollments": 8,
      "totalLessons": 18
    }
  }
  ```

#### `PUT /api/admin-dashboard/users/:id/role`
- **Purpose:** Promotes or demotes user roles dynamically (`student`, `instructor`, `content_manager`, `admin`).
- **Safety Guard:** Verifies if the authenticated admin is updating their own account. Self-demotion is strictly rejected with `400 Bad Request` ("Cannot modify own administrative privileges") to prevent lockout.
- **Request Body:** `{ "role_type": "instructor" }`

---

### 2. MCQ Quiz Auto-Grading Controller (`api::quiz`)

#### `GET /api/quizzes/:id`
- **Anti-Cheat Pipeline:** The controller sanitizes the quiz schema, completely omitting `correct_option_index` and question explanations from the public response payload to prevent browser devtools cheating.

#### `POST /api/quizzes/:id/submit`
- **Student-Only Guard:** Rejects non-students with `403 Forbidden` to ensure test attempt records are created exclusively for learners.
- **Server Auto-Grading Logic:**
  1. Retrieves true answer keys directly from the database.
  2. Compares student option indices against verified keys.
  3. Computes percentage score: `Math.round((correctCount / totalQuestions) * 100)`.
  4. Checks pass threshold: `passed = score >= quiz.passing_score`.
  5. Records the attempt in the `quiz_attempts` table.
- **Request Body:** `{ "answers": { "q1": 1, "q2": 2, "q3": 0 } }`
- **Response Payload:**
  ```json
  {
    "score": 100,
    "passed": true,
    "passingScore": 70,
    "totalQuestions": 3,
    "correctCount": 3
  }
  ```

---

### 3. Draft-Isolated Blog Controller (`api::blog-post`)

#### `GET /api/blog-posts`
- **Database-Level Query Isolation:** Inspects the authenticated user's role:
  - If unauthenticated, `student`, or `instructor`: Injects SQL query filter `WHERE is_published = TRUE`. Unpublished drafts are never retrieved from the database.
  - If `content_manager` or `admin`: Retrieves all published and draft articles with author relations.

#### `GET /api/blog-posts/:slug`
- **Direct Access Guard:** If an unauthenticated user or student attempts to access a draft slug directly, the controller returns `404 Not Found`.

#### Authoring Routes (`POST`, `PUT`, `DELETE`)
- Restricted exclusively to `content_manager` and `admin` roles. Non-authors receive `403 Forbidden`.

---

### 4. Sequential Course & Progress Engine (`api::enrollment`)

#### `POST /api/enrollments/enroll`
- Enrolls a student in a course with a unique database constraint on `(user_id, course_id)` to prevent duplicate enrollments. Initial progress is set to `0`.

#### `PUT /api/enrollments/:id/progress`
- **Ownership Verification:** Verifies `ctx.state.user.id === enrollment.user.id`.
- **Deduplication & Recalculation:**
  1. Appends `lessonId` into `completed_lessons` array without duplicates.
  2. Queries total lessons associated with the course.
  3. Computes: `progress = Math.round((completedLessons.length / totalLessons) * 100)`.
  4. Persists the updated progress percentage in PostgreSQL.

---

## Content-Types Schema & Relational Model

| Entity | Content-Type UID | Fields | Relations |
|---|---|---|---|
| **User** | `plugin::users-permissions.user` | `username`, `email`, `password`, `role_type` (enum) | 1:N Courses, 1:N Enrollments, 1:N Blog Posts |
| **Course** | `api::course.course` | `title`, `slug`, `description`, `category`, `cover_color` | M:1 Instructor (`User`), 1:N Lessons, 1:1 Quiz |
| **Lesson** | `api::lesson.lesson` | `title`, `order` (integer), `video_url` | M:1 Course |
| **Enrollment** | `api::enrollment.enrollment` | `progress` (0-100), `completed_lessons` (JSON) | M:1 Student (`User`), M:1 Course |
| **Quiz** | `api::quiz.quiz` | `title`, `description`, `passing_score`, `questions` (JSON) | 1:1 Course, 1:N Quiz Attempts |
| **Quiz Attempt** | `api::quiz-attempt.quiz-attempt` | `score` (integer), `passed` (boolean), `submitted_answers` (JSON) | M:1 Student (`User`), M:1 Quiz |
| **Blog Post** | `api::blog-post.blog-post` | `title`, `slug`, `excerpt`, `content` (richtext), `is_published` | M:1 Author (`User`) |

---

## Automated Bootstrap & Seed Data Loader (`src/index.ts`)

During server startup, the bootstrap lifecycle automatically populates the database idempotently:
1. **Public & Authenticated Permissions:** Assigns read access for courses, lessons, and published blogs.
2. **Demo User Accounts:** Seeds 4 active accounts (`admin@demo.com`, `content@demo.com`, `instructor@demo.com`, `student@demo.com` with password `Password123!`).
3. **Demo Courses & Video Lessons:** Seeds 2 complete courses with embedded YouTube video lectures in sequential order.
4. **Pre-Seeded Student Progress:** Pre-enrolls `student@demo.com` in Course 1 with 67% progress (2 completed lessons).
5. **MCQ Quiz & Blog Articles:** Seeds a 3-question mastery quiz with passing criteria and 2 blog posts (1 published, 1 draft).

---

## Environment Variables Configuration

| Variable | Local Development | Production (Railway) | Description |
|---|---|---|---|
| `HOST` | `0.0.0.0` | `0.0.0.0` | Server network binding interface |
| `PORT` | `1337` | `1337` | Server HTTP listening port |
| `PUBLIC_URL` | `http://localhost:1337` | `https://*.up.railway.app` | Canonical public backend domain |
| `FRONTEND_URL` | `http://localhost:3000` | `https://*.vercel.app` | Client domain for CORS validation |
| `DATABASE_CLIENT` | `sqlite` | `postgres` | Database client selector |
| `DATABASE_URL` | - | `postgresql://...` | PostgreSQL connection string |
| `JWT_SECRET` | Auto-configured | Generated (32-char) | HS256 JWT signing secret |
| `ADMIN_JWT_SECRET` | Auto-configured | Generated (32-char) | Admin console authentication secret |
| `APP_KEYS` | Auto-configured | Generated (4 keys) | Session & cookie signing keys |

---

## Running Locally

### Prerequisites
- **Node.js:** `v20.x` or `v22.x` LTS
- **npm:** `v10+`

### Setup Steps
```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create local environment configuration
cp .env.example .env

# 4. Start Strapi in development mode (SQLite used automatically)
npm run develop

# 5. Access Swagger Documentation
# Open http://localhost:1337/documentation/v1.0.0 in your browser

# 6. Build and launch in production mode
npm run build
npm run start
```
