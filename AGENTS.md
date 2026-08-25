# AGENTS.md — Project Context for Antigravity

You are helping build **PathShala**, an LMS (Learning Management System), as a graded project-round
submission for a Junior Software Engineer position. The full spec is in `docs/requirements.md` —
read it fully before writing any code. The design system is in `docs/design/design.md` and a
reference mockup is `docs/design/design.html`.

## Non-negotiable rules for how you work

1. **Never do the whole project in one shot.** Follow `PROJECT_PLAN.md` phase by phase, in order.
2. **After finishing each phase**: (a) tell me what you built and why, (b) run it locally and
   confirm it actually works (don't just claim it works), (c) stage and commit with a clear,
   conventional commit message scoped to that phase only, (d) show me `git diff --stat` (or
   equivalent short summary of changed files) and **wait for me to explicitly say "push"** before
   running `git push` — never push without that explicit go-ahead, (e) after pushing, **stop and
   wait for my go-ahead** before starting the next phase. Do not auto-continue to the next phase,
   and do not push without step (d)'s approval.
3. **Never bundle multiple phases into one commit.** One phase's work = one or a few small commits,
   never a single giant commit for the whole app. A single "initial commit with everything" is
   treated as a red flag by the graders — avoid it completely.
4. **Explain, don't just generate.** Before writing a non-trivial piece of logic (auth policies,
   progress calculation, quiz scoring), write 2-4 lines of your reasoning first, in plain language,
   so I can actually learn and repeat it in my own words during the video walkthrough. I need to be
   able to explain every line myself — assume I will be asked to.
5. **Role-based access is enforced on the backend, always.** Never rely on hiding UI elements as
   the only protection. Every Strapi content-type/route must have real permission policies checked
   against the Permission Matrix in `docs/requirements.md`. Frontend route guards are a UX nicety,
   not the security boundary.
6. **Ask before big/ambiguous decisions** (e.g. exact Strapi schema field names, whether to use
   NextAuth vs Strapi's own JWT flow, DB choice on Railway). Propose 1-2 options with a short
   trade-off, then wait for my pick — don't silently choose and move on.
7. **Follow `docs/design/design.md` token system exactly** (colors, type scale, spacing, component
   patterns). Don't invent new colors or spacing values per page.

## How Strapi content-types get built (important workflow note)
 
Content-types (Course, Lesson, Quiz, Progress, Blog Post) should be designed via the **Strapi
admin panel's Content-Type Builder** in local development mode — it writes real schema/controller/
service/route files to `backend/src/api/...` on disk. After using the dashboard for a schema
change, always show me the generated files and explain what was added before writing any custom
logic on top (policies, custom controllers for grading/progress). Custom access-control logic and
business logic (quiz auto-grading, progress %) cannot be done via the dashboard — those must be
hand-written in `policies/`, `controllers/`, `services/`. All schema design happens locally and
gets committed — never rely on changing the schema via the dashboard in production (Railway).

## Tech stack (fixed — do not deviate)

- Frontend: **Next.js** (App Router, TypeScript) → deployed on **Vercel**
- Backend/CMS: **Strapi** → deployed on **Railway**
- Auth: Strapi's built-in Users & Permissions plugin, extended with a custom `role` field
  (admin / content_manager / instructor / student) — plan the exact approach with me in Phase 1
  before building it.

## Commit message convention

```
<phase-tag>: <short description>

Examples:
  backend: add course & lesson content-types with role permissions
  backend: implement quiz auto-grading endpoint
  frontend: build student dashboard per design.md tokens
  frontend: wire up enrollment flow to Strapi API
  fix: instructor could edit other instructors' courses (permission leak)
```

## Definition of "done" for each phase

A phase is not done until: it runs locally without errors, the relevant part of the Permission
Matrix is verified (test with at least 2 different roles), and I've confirmed I understand what
was built well enough to explain it on camera.
