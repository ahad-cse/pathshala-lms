# PathShala — LMS (CPS Academy Junior Software Engineer Project Round)

## Tech stack

- Frontend: Next.js (App Router, TypeScript) — deployed on Vercel
- Backend/CMS: Strapi — deployed on Railway

## Running locally

### Prerequisites
- Node.js 20.x or 22.x LTS
- npm 10+

### 1. Backend (Strapi CMS)
```bash
cd backend
npm install
# Copy env example if not present and configure secrets
cp .env.example .env
npm run develop
```
The Strapi Admin panel will be available at [http://localhost:1337/admin](http://localhost:1337/admin) and API at [http://localhost:1337](http://localhost:1337).

### 2. Frontend (Next.js App)
```bash
cd frontend
npm install
# Copy env example if not present
cp .env.example .env.local
npm run dev
```
The Next.js application will be running at [http://localhost:3000](http://localhost:3000).

## Features completed

<!-- TODO: update this checklist honestly as each phase in PROJECT_PLAN.md is finished -->

- [ ] Auth + 4-role access control (backend-enforced)
- [ ] Course & lesson management (Admin / Content Manager / Instructor)
- [ ] Course enrollment + "My Courses"
- [ ] Sequential lesson viewing
- [ ] Progress tracking (persisted, per student per course)
- [ ] Quiz with server-side auto-grading
- [ ] Admin panel (user/role management + platform stats)
- [ ] Blog with draft/publish workflow

## Live links

- Frontend: <!-- TODO -->
- Backend: <!-- TODO -->
- Video walkthrough: <!-- TODO -->

## Test credentials

<!-- TODO: fill in during Phase 11, same values go in the submission form's "Test Credentials / Notes" field -->

| Role | Email | Password |
|---|---|---|
| Admin | | |
| Content Manager | | |
| Instructor | | |
| Student | | |
