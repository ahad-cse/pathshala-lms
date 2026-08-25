# PathShala LMS — Design System

> Product name used in this design: **PathShala** (পাঠশালা). Feel free to rename it in Antigravity — the token system below stays the same either way.
> Direction reference: **sitebari.com** (Bangladeshi eCommerce SaaS dashboard — bKash/Nagad/Pathao integrations, sidebar-driven admin panel, stat-card dashboards, pricing-tier cards). This doc adapts that *dashboard-first SaaS* language to an LMS: sidebar navigation, stat cards, role-driven UI, course/lesson cards, progress bars, quiz cards.

---

## 1. Brand & Direction

PathShala is not a marketing site — it's a **role-based operating dashboard**, exactly like Sitebari is a store-operating dashboard. The interview panel is grading role-based access control above everything, so the design leans into that: **every screen visually tells you who you are and what you're allowed to touch.**

**Signature element:** a **role-accent system**. Each of the 4 roles gets one fixed color used consistently as a left-border strip on the sidebar, the avatar ring, and small role badges anywhere a user's role is shown:

| Role | Color | Hex |
|---|---|---|
| Admin | Indigo | `#4F46E5` |
| Content Manager | Teal | `#0D9488` |
| Instructor | Amber | `#D97706` |
| Student | Rose | `#E11D48` |

This isn't decoration — it's the visual proof, screen by screen, that access differs strictly by role (which is literally what the job description grades you on).

---

## 2. Color Tokens

> Updated from an actual screenshot of sitebari.com (not guessed). Real brand colors: a warm
> orange (`#F2662A`-ish) as the sole accent, near-black navy headline text, a black CTA button as
> the secondary "premium" action, pure white background with a very light dotted grid texture.

```css
:root {
  /* Base */
  --ink:          #0F172A;   /* primary text — near-black navy, matches sitebari's headline color */
  --ink-soft:     #667085;   /* secondary/body text — matches sitebari's subtext gray */
  --ink-faint:    #98A2B3;   /* placeholder / meta text */
  --canvas:       #F7F8FA;   /* app background — near-white, slightly tinted so surface cards read as "lifted" (sitebari's marketing page itself is pure #FFFFFF; the app/dashboard side gets this faint tint for depth) */
  --surface:      #FFFFFF;   /* cards, panels, sidebar */
  --border:       #E5E7EB;   /* matches sitebari's light pill/card borders */
  --border-soft:  #F0F1F3;

  /* Brand — sitebari's actual accent */
  --primary:      #F2662A;   /* sitebari orange — logo mark, "New" badge, active nav, primary CTA */
  --primary-dark: #D9531D;   /* hover/active */
  --primary-soft: #FDECE3;   /* tinted backgrounds, active nav item, badges */

  /* Secondary CTA — sitebari's "Start for free" black pill */
  --dark-cta:       #10131A;
  --dark-cta-hover: #000000;

  /* Role accents (this app's own addition — not from sitebari, see Section 1) */
  --role-admin:   #4F46E5;
  --role-content: #0D9488;
  --role-instructor: #B45309;
  --role-student: #E11D48;

  /* Semantic */
  --success:      #16A34A;
  --success-soft: #E7F8ED;
  --warning:      #B45309;
  --warning-soft: #FEF3E2;
  --danger:       #DC2626;
  --danger-soft:  #FDEAEA;

  /* Data viz / progress */
  --progress-track: #EDEEF1;
  --progress-fill:  #F2662A;   /* now brand orange, not indigo */
}
```

Usage rule: **canvas ≠ surface.** The page background is always `--canvas`; every card/table/modal sits on `--surface` with a 1px `--border` and an 8–12px radius. This is what gives a dashboard depth without shadows-everywhere.

**Brand color vs. role color — don't confuse them:** `--primary` (orange) is *sitebari's* brand
identity — use it for the logo mark, primary buttons ("Enroll," "Save," "Publish"), links, and
focus rings, everywhere, regardless of who's logged in. The `--role-*` colors are a *separate*
system this design adds on top, used only for the sidebar active-accent, avatar ring, and role
badge — i.e. only where the UI needs to say "this is who you are," not for general actions.

---

## 3. Typography

| Role | Typeface | Notes |
|---|---|---|
| Display / headings | **Plus Jakarta Sans** (600/700) | Geometric, confident, reads well at dashboard heading sizes (20–32px). Not Inter-for-everything. |
| Body / UI | **Inter** (400/500) | Neutral workhorse for tables, forms, nav, buttons. |
| Data / numeric / code | **JetBrains Mono** (500) | Used only for numbers that matter: progress %, quiz scores, stat-card figures, timestamps. Monospace numerals make stats feel precise rather than decorative. |

Type scale (px / line-height):
```
H1  28/36  Jakarta 700   -- page titles ("My Courses", "Admin Panel")
H2  20/28  Jakarta 600   -- section headers, card group titles
H3  16/24  Jakarta 600   -- card titles (course name, lesson name)
Body 14/22 Inter 400     -- default UI text
Small 12/18 Inter 500    -- labels, meta text, table headers (uppercase, +0.02em tracking)
Stat 26/30 JetBrains 500 -- big numbers on stat cards / progress %
```

---

## 4. Layout System

**Shell:** fixed left sidebar (240px) + top bar (64px) + scrollable content area, max content width 1180px, 24px page padding. This mirrors Sitebari's "Dashboard / Order / Products / Analytics" tab structure — swap those tabs for role-specific nav.

```
┌───────────┬──────────────────────────────────────────┐
│           │  Topbar: page title · search · avatar     │
│  Sidebar  ├──────────────────────────────────────────┤
│  (role-   │                                            │
│  accented)│   Stat card row (3–4 cards)                │
│           │                                            │
│  nav      │   Section: Course grid / Table / Quiz list │
│           │                                            │
│  items    │                                            │
│           │                                            │
│  user     │                                            │
│  card ↓   │                                            │
└───────────┴──────────────────────────────────────────┘
```

Sidebar nav is **role-driven, not just role-styled** — a Student never sees "Manage Users" in the DOM at all, an Instructor never sees "All Courses," only "My Courses." (This maps 1:1 to the permission matrix — build the nav array server-driven or from the JWT role claim, not CSS-hidden.)

Spacing scale: `4 · 8 · 12 · 16 · 24 · 32 · 48` — stick to this everywhere, no arbitrary values.
Radius scale: `8px` (buttons, inputs, badges) · `12px` (cards) · `16px` (modals).

---

## 5. Core Components

**Sidebar item** — icon + label, 4px left accent bar in `--role-*` color when active, `--primary-soft` background when active, `--ink-soft` text when inactive.

**Stat card** (`Dashboard benefits` pattern from Sitebari) — surface card, small uppercase label top (`--ink-soft`), big JetBrains Mono number, tiny trend/context line below. E.g. "Courses Enrolled — 4" · "Avg. Progress — 62%" · "Quizzes Taken — 9".

**Course card** — cover strip (color block by category, not a stock photo — keeps it fast and non-generic), H3 title, instructor name (Inter 12px `--ink-soft`), progress bar if enrolled, else an "Enroll" button in `--primary`.

**Progress bar** — 6px track `--progress-track`, fill `--progress-fill`, rounded-full, numeric % in JetBrains Mono right-aligned above it. Never just a bar with no number — the requirement explicitly asks for an accurate visible percentage.

**Role badge** — pill, 12px Inter 600, background = role's `-soft` tint (add a `-soft` at 12% opacity of the role color), text = role color, dot prefix.

**Quiz card** — question number chip (`01/05` style — here numbering is *legitimate* because it's a real sequence), MCQ options as radio rows, submit button disabled until an option is picked, result state shows a colored banner (`--success-soft` / `--danger-soft`) with score, not just a toast.

**Table** (Admin → user list, course list) — `--surface` rows on `--canvas` page bg, 1px `--border-soft` row dividers, no zebra striping, role column always rendered as the Role badge component above, action column right-aligned icon buttons.

**Draft/Published pill** (Blog) — Draft: neutral gray pill. Published: `--success-soft`/`--success` pill. This binary state should be the loudest thing on a blog row, since leaking a draft to students is a graded failure mode.

**Buttons** — Primary: solid `--primary` (orange), white text, 8px radius, 10px/16px padding. Secondary: `--surface` bg, 1px `--border`, `--ink` text. Destructive: `--danger` text, transparent bg, `--danger-soft` on hover. Dark/emphasis (borrowed from sitebari's "Start for free" pill): solid `--dark-cta`, white text — reserve for the single most important action on a page (e.g. "Publish" on the blog editor, "Submit Quiz"), don't use it and `--primary` on the same screen for competing actions.

---

## 6. Page-by-Page Notes

- **Auth (Login/Signup):** centered card (400px) on `--canvas`, no sidebar. Role is *assigned by Admin after signup*, not selectable at signup (matches "Admin manages users and assigns roles" — signing up as your own Admin would be a permission leak).
- **Student → Browse Courses:** grid of Course cards, filter chips by category, Enroll CTA.
- **Student → My Courses:** same card, now shows progress bar + "Continue" instead of "Enroll."
- **Lesson viewer:** left = lesson list for the course (checkmarks for completed), right = content pane (text block or embedded video URL), "Mark complete" button bottom-right, updates the progress bar in the sidebar list live.
- **Quiz:** one question per screen or single-scroll form (your call), auto-grade banner + stored result shown again if the student revisits ("You scored 4/5 on 21 Aug").
- **Instructor dashboard:** stat cards scoped to *their* courses only, course table filtered to `instructor_id = me`, "Add Lesson"/"Add Quiz" actions only on their own rows.
- **Content Manager dashboard:** same shell as Instructor but table shows *all* courses (per matrix), plus a Blog tab.
- **Admin panel:** extra sidebar section "Platform" → Users (role dropdown inline, protected against self-demotion-to-zero-admins edge case), Stats (total users per role, total courses, total enrollments as Stat cards), full Courses/Blog oversight.
- **Blog list (public):** only `status=published` posts, Draft ones simply never returned by the API to non-owners — don't filter client-side only.

---

## 7. What Makes This Not Look AI-Generated

- No hero gradient, no glossy 3D blob illustrations, no generic stock photography.
- Course "covers" are flat color blocks (deterministic hash of course name → one of 6 palette-safe colors), not placeholder photos.
- Numbers are JetBrains Mono, not the same weight as body text — that alone kills the "default ChatGPT dashboard" look.
- The role-accent system is unique to this brief and is argued from the grading rubric, not bolted on.
- Copy is plain and in the product's own voice ("Mark complete," not "Submit Progress"; "Published," not "Live").

---

## 8. Assets to hand Antigravity alongside this file

- `design.html` (attached) — static reference mockup of the Student Dashboard using these exact tokens. Point Antigravity at it and say "match this token system across every screen," don't ask it to re-invent colors per page.
- Google Fonts: Plus Jakarta Sans, Inter, JetBrains Mono (all free, `@import` or `next/font/google`).
