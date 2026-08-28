# PathShala LMS — Enterprise Full-Stack Learning Management System

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015%20App%20Router-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Strapi](https://img.shields.io/badge/Backend-Strapi%20v5%20Headless%20CMS-purple?style=flat&logo=strapi)](https://strapi.io/)
[![Swagger](https://img.shields.io/badge/API%20Docs-OpenAPI%20%2F%20Swagger-85EA2D?style=flat&logo=swagger)](https://swagger.io/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20SQLite-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Deployment](https://img.shields.io/badge/Deployment-Vercel%20%2B%20Railway-success?style=flat)](https://railway.app)


## Live Production Deployments

| Component | Platform | Live URL | Description |
|---|---|---|---|
| **Web Application** | Vercel | [https://pathshala-lms.vercel.app](https://pathshala-lms.vercel.app) | Next.js App Router Frontend |
| **Backend REST API** | Railway | [https://pathshala-lms-production.up.railway.app](https://pathshala-lms-production.up.railway.app) | Strapi Headless API Gateway |
| **Interactive API Docs** | Swagger | [https://pathshala-lms-production.up.railway.app/documentation/v1.0.0](https://pathshala-lms-production.up.railway.app/documentation/v1.0.0) | OpenAPI Interactive Swagger UI |
| **CMS Admin Console** | Railway | [https://pathshala-lms-production.up.railway.app/admin](https://pathshala-lms-production.up.railway.app/admin) | Strapi Database & Content Studio |
| **Video Walkthrough** | Google Drive | [Watch Video Walkthrough](#) | Comprehensive technical walkthrough |

---

## System Architecture & Data Flow

```mermaid
flowchart TD
    %% Client Tier
    subgraph Client ["🖥️ 1. CLIENT TIER (Next.js 15 App Router / Vercel)"]
        direction TB
        Roles["👥 4-Role System (Admin • Content Manager • Instructor • Student)"]
        AuthCtx["🔐 AuthContext (JWT Authentication + 1-Click Demo Switcher)"]
        UI["🎨 Feature Modules (Video Player • Auto-Graded Quiz • TipTap Blog • Admin Panel)"]
        Roles --> AuthCtx --> UI
    end

    %% Transport Client -> Server
    Client -->|"🌐 REST API (HTTPS + Bearer JWT Header)"| API

    %% Backend Tier
    subgraph API ["⚙️ 2. BACKEND API CORE (Strapi v5 / Railway)"]
        direction TB
        RBAC["🛡️ RBAC Policy Guards & Scoped Authorization"]
        M1["📚 Course & Lesson Streaming (/api/courses, /api/lessons)"]
        M2["📈 Live Progress Engine: (completed / total) * 100 (/api/progress/toggle)"]
        M3["📝 Anti-Cheat MCQ Auto-Grader (/api/quizzes/:id/submit)"]
        M4["📰 Blog Studio with Draft SQL Isolation (/api/blog-posts)"]
        RBAC --> M1 & M2 & M3 & M4
    end

    %% Transport Server -> DB
    API -->|"⚡ Knex / Database Connection Pool"| DB

    %% Database Tier
    subgraph DB ["🗄️ 3. PERSISTENCE LAYER (PostgreSQL on Railway / SQLite Local)"]
        direction LR
        D1[("up_users<br/>Roles & Bcrypt")]
        D2[("courses & lessons<br/>1:N Curriculum")]
        D3[("enrollments & progress<br/>Live % Tracking")]
        D4[("quizzes & attempts<br/>Score Breakdown")]
        D5[("blog_posts<br/>Draft vs Published")]
    end
```

---

## Repository Structure (Monorepo)

```
pathshala-lms/
├── backend/                  # Strapi v5 Headless CMS & TypeScript Backend
│   ├── config/               # Database, server, plugins, CORS & security configurations
│   ├── src/
│   │   ├── api/
│   │   │   ├── admin-dashboard/ # Admin platform statistics & role management controllers
│   │   │   ├── blog-post/       # Blog schema & draft-isolated controllers
│   │   │   ├── course/          # Course schemas & instructor relations
│   │   │   ├── enrollment/      # Student enrollment & progress tracking
│   │   │   ├── lesson/          # Lesson content & video lecture streaming
│   │   │   └── quiz/            # MCQ Quiz schema & server auto-grading engine
│   │   └── index.ts          # Automated bootstrap & demo data seeder
│   └── package.json
├── frontend/                 # Next.js 15 App Router Frontend
│   ├── src/
│   │   ├── app/              # Routes: /, /courses, /my-courses, /admin, /blog, /login
│   │   ├── components/       # AppShell, Sidebar, RichTextEditor, VideoPlayer
│   │   ├── context/          # AuthContext with 4-role state management
│   │   ├── lib/              # Type-safe API client (apiFetch)
│   │   └── types/            # Strict TypeScript interfaces
│   └── package.json
├── docs/                     # Architectural documentation & deployment guide
├── AGENTS.md                 # Development rules & design principles
├── PROJECT_PLAN.md           # Step-by-step phased implementation roadmap
└── README.md                 # Main project documentation
```

---

## All Implemented Features

### 1. Authentication & Role-Based Access Control
- **Strict 4-Role Permission System:** Distinct roles and capabilities for **Admin**, **Content Manager**, **Instructor**, and **Student** enforced on both frontend and backend.
- **JWT Session Security:** Secure HS256 token authentication with automatic session persistence across browser refreshes using `localStorage` and `cookies`.
- **Smart Role Redirects:** Automatically directs users to their dedicated dashboard on login (`/dashboard` for Admin, `/instructor/courses` for Instructor, `/courses` for Content Manager, `/my-courses` for Student).
- **Protected Route Middleware:** Prevents unauthorized role access with automatic fallback navigation.

### 2. Course Catalog & Curriculum Management
- **Course Studio:** Create, edit, and delete courses with title, category tags, custom gradient cover colors, and Unsplash cover images.
- **Role-Scoped Management:** Instructors manage their own courses and view enrolled student rosters; Content Managers and Admins can manage all courses platform-wide.
- **Lesson Management:** Add sequential video lessons with streaming URLs and lecture notes.
- **Co-Instructor Collaboration:** Assign multiple instructors to co-teach courses.
- **Search & Category Filters:** Quickly find courses by keyword or category.

### 3. Student Learning Portal & Video Player
- **1-Click Enrollment:** Students can browse the catalog and enroll in any course instantly.
- **My Courses Dashboard (`/my-courses`):** Dedicated student portal displaying enrolled courses, dynamic progress bars, and quick resume links.
- **Sequential Lesson Drawer:** Embedded video player with an interactive sidebar showing lesson order and completion checkmarks (`✓`).
- **Real-Time Progress Tracking:** Click "Mark as Completed" to instantly calculate progress (e.g. 2 of 3 lessons = 67%) and save it to the database.
- **Completion Celebration:** Animation on 100% course completion with smart return buttons to the student dashboard.

### 4. MCQ Quizzes & Server-Side Auto-Grading
- **Anti-Cheat Key Protection:** Correct answers and explanations are kept securely on the server and never sent to the browser during the quiz.
- **Instant Server Auto-Grading:** Automatically grades student submissions, calculates percentage scores, checks pass/fail status, and records attempts.
- **Score Badges & Quiz Retake:** Displays previous scores (e.g. "Score: 85% • Passed ✓") on course and lesson pages with an instant "Retake Quiz" button.
- **Instructor Preview Mode:** Instructors and Content Managers can test their quizzes safely in preview mode without saving fake student grades.

### 5. Admin Dashboard & User Management
- **Live Platform** Real-time summary cards tracking Total Registered Users, Active Courses, Total Enrollments, and Published Lessons.
- **Self-Demotion Lockout Guard:** Prevents admins from accidentally removing their own admin access.
- **Course & User Administration:** Search, filter, and delete users directly from the admin panel.

### 6. Blog Portal with Visual Rich-Text Editor & Draft Security
- **Interactive Visual Editor:** Authors write articles with real-time formatting for Headings (H1, H2, H3), Bold, Italic, Code Blocks, Blockquotes, and Lists.
- **Database Draft Isolation:** Draft articles are filtered out at the SQL level (`WHERE is_published = TRUE`) and remain hidden from students and visitors.
- **Direct Link Protection:** Navigating directly to an unpublished draft URL returns `404 Not Found` for non-authors.
- **Cover Images & Author Details:** Includes cover images, publication dates, and author profile badges.

### 7. Developer Experience & API Tools
- **Interactive API Documentation (Swagger UI):** Explore and test all backend endpoints interactively in your browser at `/documentation/v1.0.0`.
- **Automatic Database Seeding:** Automatically migrates and pre-populates all demo accounts, courses, lessons, progress, and quizzes on first launch.
- **Mobile-Responsive Design:** Fully responsive layout with a collapsible mobile hamburger drawer and touch-friendly controls.

## Running Locally

### Prerequisites
- **Node.js:** `v20.x` or `v22.x` LTS
- **npm:** `v10+`

### 1. Clone the Monorepo
```bash
git clone https://github.com/ahad-cse/pathshala-lms.git
cd pathshala-lms
```

### 2. Setup & Run Backend (Strapi v5)
```bash
cd backend
npm install
# Copy environment template (SQLite is used automatically for local development)
cp .env.example .env
npm run develop
```
- **Backend API:** `http://localhost:1337`
- **Swagger Documentation:** `http://localhost:1337/documentation/v1.0.0`
- **Admin Panel:** `http://localhost:1337/admin`
- *On first launch, Strapi automatically runs database migrations and seeds all demo accounts, courses, lessons, progress, and quizzes.*

### 3. Setup & Run Frontend (Next.js 15)
In a separate terminal:
```bash
cd frontend
npm install
# Create local environment config
cp .env.example .env.local
npm run dev
```
- **Web App:** Open [http://localhost:3000](http://localhost:3000) in your browser.

---
