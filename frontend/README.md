# PathShala LMS — Frontend Application & Client Studio

[![Next.js](https://img.shields.io/badge/Next.js-v15%20(App%20Router)-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-v19-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![TipTap](https://img.shields.io/badge/RichText-TipTap%20Engine-black?style=flat)](https://tiptap.dev/)
[![Deployment](https://img.shields.io/badge/Hosted%20on-Vercel-success?style=flat)](https://vercel.com)

> The client application for **PathShala LMS**, engineered using **Next.js 15 (App Router, Turbopack, TypeScript)**. It features role-based visual route guards, interactive video streaming, dynamic course progress tracking, server auto-graded quiz runners, a visual rich-text blog studio, and a 1-click demo login switcher.

---

## Live Application

- **Production Frontend:** [https://pathshala-lms.vercel.app](https://pathshala-lms.vercel.app)
- **Connected Backend API:** [https://pathshala-lms-production.up.railway.app](https://pathshala-lms-production.up.railway.app)

---

## Client Architecture & Directory Map

```
frontend/src/
├── app/                      # Next.js 15 App Router Directory
│   ├── layout.tsx            # Global Root Layout with AuthProvider & Design Tokens
│   ├── page.tsx              # Public Landing Page & Latest Publications Feed
│   ├── login/page.tsx        # Sign In with 1-Click Demo Switcher
│   ├── signup/page.tsx       # Student Self-Registration Form
│   ├── dashboard/page.tsx    # Role-Adaptive User Command Center
│   ├── courses/              # Course Catalog & Content Manager CMS
│   │   ├── page.tsx          # Public/Enrolled Course Grid
│   │   └── [courseId]/
│   │       ├── lessons/[lessonId]/page.tsx # Sequential Video Player & Drawer
│   │       └── quiz/[quizId]/page.tsx      # MCQ Quiz Runner & Auto-Grader
│   ├── my-courses/page.tsx   # Student Enrolled Courses & Progress Metrics
│   ├── instructor/           # Instructor-Specific Portals
│   │   ├── courses/page.tsx  # Author Course Studio (Create / Edit / Delete)
│   │   └── quizzes/page.tsx  # Quiz Creator & Preview Studio
│   ├── blog/                 # Knowledge Hub & Blog Studio
│   │   ├── page.tsx          # Published Articles & TipTap Creation Studio
│   │   └── [slug]/page.tsx   # Single Article Reader with HTML Renderer
│   └── admin/page.tsx        # Administrator Platform Analytics & Role Switcher
├── components/               # Reusable Modular UI Components
│   ├── AppShell.tsx          # Main Responsive Shell with Header & Navigation
│   ├── Sidebar.tsx           # Role-Filtered Navigation Sidebar
│   ├── Topbar.tsx            # Header Bar with 1-Click Demo Role Switcher
│   ├── RichTextEditor.tsx    # TipTap Visual Rich-Text Formatting Engine
│   └── VideoPlayer.tsx       # YouTube & External Video Player
├── context/
│   └── AuthContext.tsx       # Centralized 4-Role Authentication & Token Storage
├── lib/
│   └── api.ts                # Type-Safe HTTP Client (apiFetch) & Scoped Handlers
└── types/
    ├── auth.ts               # User, RoleType, Token & Session Interfaces
    └── content.ts            # Course, Lesson, Quiz, Blog & AdminStats Interfaces
```

---

## Core Frontend Subsystems

### 1. Centralized Authentication & 4-Tier Role Guard (`AuthContext.tsx`)
- **JWT Storage:** Stores the JSON Web Token in `localStorage('token')` and validates user sessions via `GET /api/users/me`.
- **4-Role State Management:** Tracks `role_type` (`student`, `instructor`, `content_manager`, `admin`) to dynamically adapt navigation links, action buttons, and control panels.
- **Client Route Guards:** Wraps privileged pages in `ProtectedRoute` components, redirecting unauthorized users while preserving security.
- **1-Click Demo Login Switcher:** Built into `/login` and the Topbar, allowing evaluators to switch between Admin, Content Manager, Instructor, and Student in one click without typing credentials.

### 2. Visual Rich-Text Editor Studio (`RichTextEditor.tsx`)
- **Engine:** Built with `@tiptap/react` and `@tiptap/starter-kit`.
- **Formatting Capabilities:** Real-time visual formatting for Headings (H1, H2, H3), Bold, Italic, Strikethrough, Blockquotes, Code Blocks, and Lists without typing raw markup.
- **Smart Placeholder:** Utilizes `@tiptap/extension-placeholder` to provide a subtle prompt that automatically disappears upon typing.
- **HTML Serialization:** Emits structured HTML payloads to the Strapi backend and renders with dark code blocks in `/blog/[slug]`.

### 3. Sequential Course Player & Curriculum Drawer
- **Video Embeds:** Automatically parses YouTube URLs into responsive embeds and supports external video streams with fallback lecture notes.
- **Curriculum Drawer:** Lists all lessons sequentially; completed lessons receive checkmarks and the next lesson unlocks dynamically.
- **Progress Tracking:** Clicking "Mark as Completed" updates progress in real time and animates the progress bar.

### 4. Interactive MCQ Quiz Runner
- **Zero-Cheat Display:** Fetches questions with stripped answer keys.
- **Option Selection:** Interactive choice selection with progress indicators.
- **Instant Server Grading:** Submits answers to the server and displays percentage scores, passing criteria, and detailed breakdowns immediately.
- **Author Preview Mode:** Provides Instructors and Content Managers with a read-only preview mode.

### 5. Type-Safe API Client (`src/lib/api.ts`)
- **Unified Fetcher:** `apiFetch(endpoint, options)` handles request timeouts, Bearer JWT header injection, and JSON error parsing.
- **Scoped Domain Handlers:**
  - `authApi`: Login, register, me
  - `coursesApi` & `lessonsApi`: Catalog fetch, CRUD operations, reordering
  - `enrollmentsApi`: Course enrollment, progress persistence
  - `quizApi`: Fetch quiz, submit for grading
  - `blogApi`: Fetch published feed, CRUD operations, publish toggle
  - `adminApi`: Platform statistics, user list, role switcher

---

## Environment Variables Configuration

| Variable | Local Development | Production (Vercel) | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:1337` | `https://*.up.railway.app` | Base URL of the Strapi backend API |

---

## Running Locally

### Prerequisites
- **Node.js:** `v20.x` or `v22.x` LTS
- **npm:** `v10+`

### Setup Steps
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Setup local environment variables
cp .env.example .env.local

# 4. Start Next.js development server
npm run dev

# 5. Create optimized production build
npm run build
npm run start
```
