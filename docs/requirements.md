# CPS Academy | Junior Software Engineer — Project Round

## LMS (Learning Management System)

Handed out: 24 August 2026 · **Deadline: 30 August 2026, 11:59 PM** (late submissions not accepted)

## Tech stack (mandatory — no deviations)

| Layer | Technology | Hosting |
|---|---|---|
| Frontend | Next.js | Vercel |
| Backend / CMS | Strapi | Railway |

Using any other framework or hosting voids the submission.

## User roles

- **Admin** — full control. Manages users and assigns/changes their roles. Can do everything.
- **Content Manager** — creates/manages courses and lessons (content library). Does not manage users.
- **Instructor** — manages lessons/quizzes of their own courses, sees progress of their own students.
- **Student** — enrolls in courses, views lessons, takes quizzes, tracks own progress.

Access must differ strictly by role — a logged-in user must only do what their role allows.

### Permission matrix

| Action | Admin | Content Manager | Instructor | Student |
|---|---|---|---|---|
| Manage users & assign roles | ✅ | ❌ | ❌ | ❌ |
| Create / edit / delete any course | ✅ | ✅ | Own only | ❌ |
| Add / edit / delete lessons | ✅ | ✅ | Own courses | ❌ |
| Create quizzes | ✅ | ✅ | Own courses | ❌ |
| View student progress | ✅ | ✅ | Own courses | Own only |
| Write / manage blog posts | ✅ | ✅ | ❌ | ❌ |
| Enroll in a course | ❌ | ❌ | ❌ | ✅ |
| Take quizzes | ❌ | ❌ | ❌ | ✅ |

Getting this 4-role access control right — cleanly, without leaks — is itself part of the evaluation.

## Core features (must be present)

1. **Authentication + Role-based access** — sign up/login with a role per user; role-based
   protected routes enforced on the **backend**, not just by hiding buttons.
2. **Course Management** (Admin / Content Manager / Instructor) — create/edit/delete per the
   matrix; lessons under each course (title + content — text or video URL).
3. **Course Enrollment** (Student) — browse and enroll; enrolled courses show under "My Courses".
4. **Lesson Viewing** (Student) — view lessons of enrolled courses in sequence.

## Differentiator features (this is where you stand out)

1. **Progress Tracking** — mark a lesson "complete"; show % progress per course (e.g. 3 of 5 =
   60%); accurate per student per course, persists across refresh.
2. **Quiz with Auto-Grading** — Instructor/Content Manager adds MCQ quiz (question + options +
   correct answer); student takes it, gets an automatic score immediately; result stored and
   viewable later.
3. **Admin Panel** — dedicated dashboard, admin-only. See all users, manage roles (promote/
   change/remove). View/manage all courses, lessons, blog posts. Basic stats (users per role,
   total courses, total enrollments).
4. **Blog — Writing & Control** — Content Manager (+ Admin) write/edit/publish/delete posts
   (title + body; cover image URL ok). Draft vs Published — only published visible to
   students/public. Anyone can read the published list/single post. Admin has full control over
   every post; Content Manager manages what the matrix allows.

## Video walkthrough (mandatory, ≤10 minutes, screen recording, your own voice)

Must cover:
- Live demo across roles: student (enroll → lesson → progress → quiz), instructor/content
  manager (create course → lesson → quiz → blog post), admin (admin panel → manage a user's role).
- Data flow — pick one feature, show frontend → Strapi backend → frontend.
- Role-based access — show backend enforcement (not just hidden UI).
- Progress tracking logic — explained line by line.
- Quiz auto-grading logic — shown in code.
- Admin panel + blog — role management demo, draft → publish flow.
- Deployment setup — Vercel + Railway config, environment variables.

If you can't explain your own code, you're out.

## Submission (one form, all 4 required or it's incomplete)

1. GitHub repo link (public — frontend + backend)
2. Frontend URL (live Vercel link)
3. Backend URL (live Railway link)
4. Video walkthrough link (Google Drive / YouTube unlisted — must be openable)

## Important rules

- Deployed app must stay live at least until interviews are over.
- Proper commit history — a single giant commit is a negative signal.
- README: how to run it locally, and which features were completed.

## On using AI

Free to use AI tools. But a fully AI-generated project will not be accepted — your own thinking
and decisions must show up in the work, and the video walkthrough is where a lack of real
understanding becomes obvious. Use AI as a tool, don't let it replace your thinking.
