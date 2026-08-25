# PROJECT_PLAN.md — PathShala LMS build plan (phase by phase)

Read this alongside `AGENTS.md` and `docs/requirements.md`. **Work through the phases below in
order. After each phase: commit, push, then STOP and wait for my confirmation before starting the
next phase.** Do not skip ahead. Do not merge two phases into one commit.

---

### Phase 0 — Repo & environment setup
- Initialize git (if not already). Create `frontend/` and `backend/` folders (monorepo, two apps).
- Scaffold Next.js (TypeScript, App Router) in `frontend/`.
- Scaffold Strapi in `backend/`.
- Add `.gitignore` for both (node_modules, .env, .next, build output).
- Copy `.env.example` files (provided) into each app folder as the template — do NOT commit real `.env`.
- Add root `README.md` skeleton (provided) — leave the "features completed" section as TODO for now.
- **Checkpoint:** both apps run locally (`npm run dev`) with a default landing page. Commit:
  `chore: scaffold Next.js frontend and Strapi backend`. Push. **Stop and wait for me.**

### Phase 1 — Roles & auth design (plan first, then build)
- Propose the exact approach for 4 custom roles on top of Strapi's Users & Permissions plugin
  (extend the default `role` relation vs. a custom `role` enum field on the User — explain the
  trade-off to me before building).
- Implement sign up / login. New users should NOT be able to self-assign a role above `student`
  (Admin assigns roles after the fact, per the spec).
- Implement Strapi permission policies per the Permission Matrix (not just default plugin roles —
  custom policies for "own course only" checks for Instructor).
- **Checkpoint:** demo — create 4 test users (one per role) via the Strapi admin panel, confirm
  login works and returns the correct role on the JWT/session. Commit: `backend: implement 4-role auth and permission policies`. Push. **Stop and wait for me.**

### Phase 2 — Course & Lesson content types
- Strapi content-types: `Course` (title, description, cover, owner/instructor relation), `Lesson`
  (title, content — text or video URL, order, belongs-to-course).
- Backend routes enforcing: Admin/Content Manager full CRUD any course; Instructor CRUD only their
  own; Student read-only.
- **Checkpoint:** test via Strapi admin + a REST client (Postman/Thunder Client) that an Instructor
  token cannot edit another instructor's course (403). Commit: `backend: course & lesson content-types with scoped permissions`. Push. **Stop and wait for me.**

### Phase 3 — Frontend shell + auth pages
- Build the shared layout (sidebar/topbar) per `docs/design/design.md` and `design.html`.
- Login/signup pages, protected route wrapper reading role from session.
- Role-driven sidebar nav (different nav items per role, not just CSS-hidden — computed from role).
- **Checkpoint:** logging in as each of the 4 test users shows a different nav/shell. Commit:
  `frontend: app shell, auth pages, role-driven navigation`. Push. **Stop and wait for me.**

### Phase 4 — Course management UI (Admin/Content Manager/Instructor)
- Create/edit/delete course + lesson forms, scoped per role in the UI to match backend permissions.
- **Checkpoint:** Content Manager can create any course; Instructor only sees/edits their own.
  Commit: `frontend: course & lesson management for admin/content-manager/instructor`. Push.
  **Stop and wait for me.**

### Phase 5 — Enrollment + "My Courses" + Lesson viewer (Student)
- Browse-courses page, Enroll action, "My Courses" list, sequential lesson viewer.
- **Checkpoint:** a student can enroll and see the course under "My Courses", and open lessons in
  order. Commit: `frontend+backend: course enrollment and lesson viewing flow`. Push. **Stop and
  wait for me.**

### Phase 6 — Progress tracking (differentiator #1)
- Backend: a join/record model (student, lesson, completed_at) or equivalent, computed % per course.
- Frontend: "Mark complete" button, live progress bar, persists across refresh.
- Walk me through, in the chat, how the percentage is computed before moving on — I need this for
  the video.
- **Checkpoint:** refresh the browser after marking a lesson complete — progress must persist.
  Commit: `backend+frontend: progress tracking, persisted per student per course`. Push. **Stop and
  wait for me.**

### Phase 7 — Quiz with auto-grading (differentiator #2)
- Backend: Quiz/Question/Option content-types with a correct-answer field, a submission endpoint
  that grades server-side (never trust a client-computed score).
- Frontend: quiz-taking UI, instant score on submit, stored result viewable later.
- Walk me through the grading logic in chat before moving on.
- **Checkpoint:** submitting a quiz twice with different answers stores/shows the correct latest
  score. Commit: `backend+frontend: MCQ quiz with server-side auto-grading`. Push. **Stop and wait
  for me.**

### Phase 8 — Admin panel (differentiator #3)
- Dedicated `/admin` area (admin-only route, enforced backend + frontend).
- User list with role management (promote/change/remove), platform stats (users per role, total
  courses, total enrollments).
- **Checkpoint:** a non-admin hitting `/admin` (or the API route) directly gets rejected. Commit:
  `frontend+backend: admin panel with role management and platform stats`. Push. **Stop and wait
  for me.**

### Phase 9 — Blog (differentiator #4)
- Content Manager/Admin: write/edit/publish/delete posts, draft vs published state.
- Public: published-only list + single post view. Confirm drafts are never returned by the API to
  non-owners (not just filtered client-side).
- **Checkpoint:** log out entirely, confirm draft posts are not visible/fetchable. Commit:
  `frontend+backend: blog with draft/publish workflow`. Push. **Stop and wait for me.**

### Phase 10 — Deployment
- Deploy `backend/` to Railway, `frontend/` to Vercel. Set up environment variables on both
  platforms (never commit secrets). Point frontend's API base URL at the live Railway backend.
- **Checkpoint:** the live Vercel URL works end-to-end against the live Railway backend, all 4
  roles tested on the deployed version, not just localhost. Commit: `chore: deployment config and
  env variable documentation`. Push. **Stop and wait for me.**

### Phase 11 — README + submission prep
- Fill in the real README (how to run locally, which features are completed).
- Confirm commit history looks like real incremental work, not one giant commit.
- **Create one seed/demo account per role** (admin, content manager, instructor, student) with
  simple, memorable credentials — e.g. `admin@demo.com` / `Demo1234!`, `content@demo.com` / ...,
  `instructor@demo.com` / ..., `student@demo.com` / ... — enroll the demo student in at least one
  demo course with some progress and one attempted quiz, so a grader logging in sees a populated
  app, not an empty one.
- Write these credentials down for the submission form's **"Test Credentials / Notes"** field, one
  line per role, plus any short note the grader should know (e.g. "Railway free tier may take
  10-15s to wake up on first request").
- I record the video walkthrough myself (not Antigravity's job).

---

**Reminder:** this repo is a **monorepo** — one GitHub repository containing both `frontend/` and
`backend/` as subfolders. The submission form has a single GitHub link field, and the spec asks
for "both frontend + backend" under that one link, so do not split this into two repositories.

---

**Reminder to the agent:** if at any point you are unsure whether something satisfies the
Permission Matrix, stop and ask rather than guessing. A permission leak found during grading is
worse than a missing feature.
