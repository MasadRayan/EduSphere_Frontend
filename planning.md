# EduSphere Frontend - Implementation Plan

## Project Overview

EduSphere is a university management platform. The backend (EduSphere_Backend-) is fully implemented: a REST API covering authentication, student and instructor onboarding with admin approval, the academic structure (departments, programs, courses, semesters, sections), semester enrollment with bKash payments, exams, attendance, results, transcripts, and role-based analytics.

This plan describes how to build the frontend with Next.js (App Router), React, TypeScript and Tailwind CSS, using Server Actions for mutations and a secure API proxy for everything that must run in the browser.

## 1. Backend Analysis Summary

Based on Api_Documentation.md (15 modules).

### Roles
`STUDENT`, `INSTRUCTOR`, `ADMIN`, `SUPER_ADMIN`

### API Base and Auth
- Base URL (prod): `https://edusphere-backend-snowy.vercel.app`, dev: `http://localhost:8000`
- All routes live under `/api/*`
- Response envelope: `{ success, statusCode, message, data, meta? }`
- Pagination meta: `{ page, limit, total, totalPages }` (default limit 10, max 100)
- Auth: `accessToken` (24h) and `refreshToken` (7d). The backend sets them as httpOnly cookies AND returns them in the response body, so the frontend can re-set them on its own domain.
- Accepts `Authorization: Bearer <accessToken>` or the `accessToken` cookie
- Soft deletes and `status`: `ACTIVE`, `BLOCKED`, `DELETED`

### Modules and who uses them

| Module | Key endpoints | Roles |
|---|---|---|
| Auth | register, verify-email (OTP), login, me, refresh-token, google-login, forgot-password, reset-password | public / all |
| Student | apply (POST/PUT), application, me, profile, avatar (multipart), registered-courses, attendance, grades, cgpa, transcript (PDF) | STUDENT |
| Student (admin side) | applications list, approve, reject, set current semester, assign section, update status | ADMIN, SUPER_ADMIN |
| Instructor | apply, application, resume upload, me, profile, avatar, list, approve/reject, update, soft delete | INSTRUCTOR / ADMIN |
| Department, Program | full CRUD with search and pagination | ADMIN, SUPER_ADMIN |
| Course | CRUD with prerequisites | write: ADMIN, read: all |
| Semester | CRUD, single active semester enforced | write: ADMIN, read: all |
| Course Section | CRUD, assign instructor | write: ADMIN, read: all |
| Student Section | CRUD with seat counts | write: ADMIN, read: all |
| Course Registration | enroll (starts bKash payment), bKash callback, my, list all, get, cancel (refund), override status | STUDENT / ADMIN |
| Payment | list all with revenue summary, my payments, get by id | STUDENT / ADMIN |
| Exam | CRUD, results per exam | INSTRUCTOR, ADMIN |
| Attendance | mark/update, fetch records | INSTRUCTOR, ADMIN |
| Result | upsert, update, list with filters | INSTRUCTOR, ADMIN |
| Analytics | admin, student, instructor dashboards (optional `semesterId`, `startDate`, `endDate`) | per role |
| User Management | list/filter, get, change role (SUPER_ADMIN only), change status, soft delete | ADMIN, SUPER_ADMIN |

### Backend gotchas the frontend must handle
1. The docs use two base URLs (Vercel for auth, localhost:8000 elsewhere). Use a single env var, never hardcode.
2. Per the appendix, auth middleware failures (not logged in, forbidden, blocked, deleted) come back as HTTP 500 with a message, not 401/403. The proxy and API client must map these messages to proper auth errors. Better: fix the backend to return 401/403 and keep the mapping as a fallback.
3. The bKash callback is a browser redirect to `<frontend>?payment=success&trxId=...&enrollmentId=...` or `?payment=failed&status=...`. It returns no JSON. Point the backend `FRONTEND_URL` at a dedicated result page (see Payments below).
4. Avatar, resume and transcript endpoints are multipart or binary (PDF), so they cannot use the JSON path. They go through the proxy route handler.
5. The register `name` field is limited to 3-10 characters and the password needs upper, lower, number and special character. Mirror these rules in Zod.
6. Students and instructors cannot use the system fully until their application is approved. The UI needs "pending / rejected / approved" gating states.

## 2. Frontend Tech Stack

- Next.js (App Router) with React, TypeScript (strict), Tailwind CSS v4
- **Server Actions**: all form mutations (login, register, apply, create/update/delete)
- **Server Components**: all initial data reads, via a server-only fetch helper
- **API Proxy**: Route Handlers at `app/api/proxy/[...path]/route.ts` for browser-side calls, multipart uploads, PDF streaming and TanStack Query
- **State**: Zustand for light client state only (current user snapshot, sidebar). Server is the source of truth.
- **Client data fetching**: TanStack Query v5 (filter-heavy tables, search-as-you-type, pagination)
- **Forms**: React Hook Form + Zod (same schemas reused inside Server Actions)
- **HTTP client**: ofetch (one server instance, one client instance)
- **UI**: shadcn/ui (Radix + Tailwind) with ALL components installed up front (`npx shadcn@latest add --all`), lucide-react, sonner
- **Charts**: recharts (analytics dashboards)
- **Dates**: date-fns
- **Images**: `next/image` everywhere, remote domains allowed in `next.config.ts` (see Images section)
- **Lint/format**: Biome

## 3. Architecture and Design Patterns (must follow)

### 3.1 Request flow

```
Server Component  -> lib/api/server-fetch.ts -> Backend      (reads, SSR, cookies via next/headers)
Server Action     -> lib/api/server-fetch.ts -> Backend      (mutations, then revalidateTag/redirect)
Client Component  -> /api/proxy/* -> Backend                 (TanStack Query, uploads, downloads)
```

Rules:
- Components never call the backend URL directly. Only the server helper and the proxy know it.
- The backend URL lives in a server-only env var (`API_URL`), never `NEXT_PUBLIC_*`.
- Tokens live only in httpOnly cookies on the frontend domain. Client JS never reads them.

### 3.2 Layered pattern (per feature)

```
schema (Zod)  ->  service (API calls)  ->  action (Server Action)  ->  UI (form/table)
```

- `validations/<feature>.ts`: Zod schema, shared by client form and server action
- `services/<feature>.service.ts`: typed functions that call the backend (server-only)
- `actions/<feature>.actions.ts`: `"use server"` functions: validate, call service, `revalidateTag`, return a typed result
- `components/<feature>/`: presentational pieces, no fetch logic inside

### 3.3 Server Action contract

Every action returns the same shape so forms handle it uniformly:

```ts
type ActionResult<T = null> =
  | { ok: true; message: string; data: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };
```

- Forms use `useActionState` plus React Hook Form for client validation
- Success: sonner toast using the backend `message`, then `revalidateTag` or `redirect`
- Failure: field errors under inputs, general error as a toast

### 3.4 Auth and token handling
- Login, verify-email and Google login actions read `accessToken` and `refreshToken` from the response body and set them with `cookies().set()` (httpOnly, secure in prod, sameSite lax, maxAge 24h / 7d).
- `getSession()` (server-only, cached per request) calls `/api/auth/me` and returns `{ user, studentProfile, instructorProfile }`.
- Refresh strategy: `server-fetch` retries once on an auth failure. It calls `/api/auth/refresh-token` with the refresh token, rewrites both cookies, then replays the request. The proxy route handler does the same for client calls.
- Logout action clears both cookies and redirects to `/login`.
- Route guard file (`src/proxy.ts` on Next.js 16, formerly `middleware.ts`; check your installed version): reads the access token, decodes the role claim without verifying, and redirects by role prefix. Real authorization is always done by the backend.

### 3.5 Role-based access
- `lib/auth/roles.ts` holds the role-to-route-prefix map and a `requireRole(...roles)` helper for layouts.
- Each dashboard `layout.tsx` calls `requireRole` so a wrong role gets redirected even if the route guard is bypassed.
- Navigation config is data-driven per role (one array per role) so sidebars never contain `if (role === ...)` chains.
- SUPER_ADMIN sees all ADMIN pages plus role change and super admin deletion controls.

### 3.6 Caching and revalidation
- Tag every read: `tags: ["departments"]`, `["course-sections", semesterId]`, `["my-enrollments"]` and so on.
- Actions call `revalidateTag` for the tags they affect. No manual refetch in components.
- Per-user data (me, analytics, my payments) is never shared-cached: use `cache: "no-store"` or user-scoped tags.

### 3.7 Folder conventions
- Server-only modules start with `import "server-only"`.
- One component per file, feature folders over type folders for UI.
- Barrel files only at feature boundaries.
- `loading.tsx`, `error.tsx` and `not-found.tsx` per route group.

### 3.8 Layouts (exactly two, plus the root)

| Layout | File | Used by | Contains |
|---|---|---|---|
| Root | `app/layout.tsx` | everything | html, body, fonts, theme + query providers, sonner toaster. No visible chrome. |
| Site | `app/(site)/layout.tsx` | landing, public pages, login/register/OTP/reset pages | Navbar (auth-aware, role-based menu), footer |
| Dashboard | `app/(dashboard)/layout.tsx` | `/student`, `/instructor`, `/admin` | Sidebar (data-driven per role), topbar (user menu, theme toggle, semester context), breadcrumbs, content area |

- The dashboard layout never renders the site navbar/footer, and the site layout never renders the sidebar.
- Role segments (`student/`, `instructor/`, `admin/`) each get a thin `layout.tsx` that only calls `requireRole(...)`.
- Logged-in users who open `/login` or `/register` are redirected to their dashboard.

## 4. Project Structure

```
src/
├── app/
│   ├── layout.tsx                   # ROOT: html, fonts, providers, toaster only
│   ├── (site)/                      # LAYOUT 1: general website (navbar + footer)
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # landing
│   │   ├── programs/                # public program/department browsing
│   │   ├── courses/[id]/
│   │   └── (auth)/                  # auth pages use the site layout, centered card
│   │       ├── login/
│   │       ├── register/
│   │       ├── verify-email/
│   │       ├── forgot-password/
│   │       └── reset-password/
│   ├── (dashboard)/                 # LAYOUT 2: dashboard (sidebar + topbar)
│   │   ├── layout.tsx               # session + role shell
│   │   ├── student/
│   │   │   ├── page.tsx             # analytics
│   │   │   ├── apply/
│   │   │   ├── profile/
│   │   │   ├── enroll/              # pick courses, start payment
│   │   │   ├── enrollments/
│   │   │   ├── payments/
│   │   │   ├── payment-result/      # bKash redirect target
│   │   │   ├── courses/             # registered courses + [id]
│   │   │   ├── attendance/
│   │   │   ├── grades/              # + [id]
│   │   │   └── transcript/
│   │   ├── instructor/
│   │   │   ├── page.tsx
│   │   │   ├── apply/
│   │   │   ├── profile/
│   │   │   ├── sections/
│   │   │   ├── exams/
│   │   │   ├── attendance/
│   │   │   └── results/
│   │   └── admin/
│   │       ├── page.tsx
│   │       ├── student-applications/
│   │       ├── instructor-applications/
│   │       ├── users/
│   │       ├── instructors/
│   │       ├── departments/
│   │       ├── programs/
│   │       ├── courses/
│   │       ├── semesters/
│   │       ├── course-sections/
│   │       ├── student-sections/
│   │       ├── enrollments/
│   │       ├── payments/
│   │       ├── exams/
│   │       ├── results/
│   │       └── analytics/
│   ├── api/
│   │   └── proxy/[...path]/route.ts
│   ├── not-found.tsx
│   └── global-error.tsx
├── actions/                          # Server Actions per feature
├── services/                         # backend calls per feature (server-only)
├── components/
│   ├── ui/                           # shadcn/ui
│   ├── shared/                       # navbar, sidebar, data-table, page-header, empty-state, stat-card
│   ├── charts/
│   └── <feature>/                    # forms and tables per feature
├── lib/
│   ├── api/
│   │   ├── server-fetch.ts           # server-only, cookie + refresh aware
│   │   ├── client-fetch.ts           # browser, targets /api/proxy
│   │   ├── errors.ts                 # maps backend messages (incl. 500 auth quirks)
│   │   └── endpoints.ts
│   ├── auth/                         # session.ts, roles.ts, cookies.ts
│   ├── validations/                  # Zod schemas
│   ├── utils/
│   └── constants.ts
├── hooks/
│   ├── queries/
│   └── use-debounce.ts
├── store/                            # Zustand
├── types/                            # api.ts, enums.ts, entities.ts
└── proxy.ts                          # route guard
```

## 5. Environment, Proxy and Images

### Environment variables (`.env.local`)

```env
# Development
API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=

# Production (set in Vercel project settings)
# API_URL=https://edusphere-backend-snowy.vercel.app
# NEXT_PUBLIC_APP_URL=https://<your-frontend-domain>
```

Backend `.env` must set the frontend URL used by the bKash callback redirect to `http://localhost:3000/student/payment-result` (and the production equivalent).

### API proxy (`app/api/proxy/[...path]/route.ts`)
- Handles GET, POST, PUT, PATCH and DELETE
- Reads the access token cookie and forwards `Authorization: Bearer ...`
- Streams the request body untouched, so `multipart/form-data` (avatar, resume) works
- Streams the response untouched, so the transcript PDF download works with its headers
- On an auth failure it refreshes once, rewrites cookies on the response, and replays
- Strips hop-by-hop headers and never forwards backend `Set-Cookie` as is
- Whitelist of allowed path prefixes so it cannot be used as an open relay

### Images (`next.config.ts`)
- Backend returns `avatarUrl` and `avatarPublicId` (looks like Cloudinary). Confirm the host, then allow it:

```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "res.cloudinary.com" },
    { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google profile photos
  ],
}
```

- Always use `next/image` for avatars, logos and hero imagery. Provide `width`/`height` or `fill` with a sized parent, and `sizes` for responsive images.
- Avatar component with a fallback to initials when `avatarUrl` is null.

## 6. Design System (follow it everywhere)

Direction: a university registrar's desk, not a SaaS template. Calm, exact, a little bold. Course codes are the main typographic unit of the product.

### Tokens

| Role | Name | Hex |
|---|---|---|
| Background | Mist | `#EEF1F6` |
| Surface | Paper | `#FFFFFF` |
| Text / dark surfaces | Slate Ink | `#12182B` |
| Primary action | Cobalt | `#2F4BFF` |
| Highlight (deadlines, grades) | Marigold | `#FFB627` |
| Success (present, paid, approved) | Moss | `#1F7A5C` |
| Danger (blocked, failed, absent) | Brick | `#C2410C` |

Dark mode: Slate Ink background with the same accents, defined as CSS variables from day one.

### Typography
- Display: Familjen Grotesk (headings, hero)
- Body: Instrument Sans
- Utility: JetBrains Mono for course codes (`CSE-101`), student IDs, trx IDs, grades and credit counts

Load with `next/font`, with real fallbacks.

### Signature element
The **course code tag**: a mono code in a bordered tag, used on every course card, enrollment row, grade row and exam row, with a thin credit-weight bar beneath it. Everything else stays quiet so this becomes the thing people remember.

### Status language (one meaning per color, used consistently)
- `PENDING` Marigold, `APPROVED` / `ENROLLED` / `ACTIVE` / `PAID` Moss, `REJECTED` / `BLOCKED` / `FAILED` / `CANCELLED` Brick, `COMPLETED` Cobalt
- One `StatusBadge` component maps every enum to its color and label

### Shared building blocks (build once, reuse)
`DataTable` (server-driven pagination, search, filters in URL search params), `PageHeader`, `StatCard`, `EmptyState`, `StatusBadge`, `ConfirmDialog`, `FormField`, `AvatarUpload`, `CourseCodeTag`, `SemesterSelect`.

### Copy and UX rules
- Sentence case, active verbs: "Approve application", "Start payment", not "Submit".
- An action keeps its name across button, toast and confirmation.
- Errors say what happened and what to do next. Empty states invite an action.
- Motion: one page-load reveal on the landing hero, subtle hover states elsewhere, `prefers-reduced-motion` respected.
- Quality floor: responsive down to mobile, visible keyboard focus, accessible dialogs and tables.

## 7. Implementation Phases

### Phase 1: Setup and Foundation
- [x] Install dependencies (ofetch, @tanstack/react-query, react-hook-form, @hookform/resolvers, zod, sonner, lucide-react, zustand, recharts, date-fns, server-only)
- [x] Set up shadcn/ui, bring in every component (`npx shadcn@latest add --all`), then apply the design tokens above. Always compose pages from these components before writing custom ones.
- [x] Create `.env.local` and `next.config.ts` (image domains)
- [x] Types: enums (Role, UserStatus, ApplicationStatus, EnrollmentStatus, PaymentStatus, etc.), envelope, pagination meta
- [x] `server-fetch`, `client-fetch`, error mapper (including the 500 auth quirk)
- [x] Proxy route handler with refresh and multipart support
- [x] Cookie helpers, `getSession`, `requireRole`, route guard
- [x] React Query provider, sonner toaster, theme provider
- [x] Shared components (DataTable, PageHeader, StatCard, EmptyState, StatusBadge)
- [x] Two layouts: site layout (navbar + footer) and dashboard layout (sidebar + topbar), see section 3.8
- [x] Dashboard shell with data-driven nav per role

### Phase 2: Authentication
- [x] Register (name 3-10, strong password) then OTP verify-email
- [x] Login with role-based redirect
- [x] Google login (ID token) action
- [x] Forgot password and reset password with OTP
- [x] Navbar with auth state, logout action
- [x] Silent token refresh verified end to end
- [x] Friendly messages for blocked, deleted and Google-only accounts

### Phase 3: Public Pages
- [x] Landing page (hero built around the course code signature, programs, how enrollment works, CTA)
- [x] Public department/program/course browsing (if the backend allows public reads, otherwise gate behind login)
- [x] Contact page (desk directory and message form)
- [x] SEO metadata, Open Graph

### Phase 4: Student Dashboard
- [x] Analytics dashboard (CGPA, credits, attendance %, grade breakdown, spend) with recharts
- [x] Enrollment application (apply, view status, edit and resubmit when pending or rejected)
- [x] Gating UI for pending/rejected applicants
- [x] Profile update and avatar upload
- [x] Course picker (max 20, credit limit feedback, prerequisite errors shown per course) then Enroll
- [x] bKash redirect, `payment-result` page (success and failure states, link to enrollment)
- [x] My enrollments (filter by status/semester), cancel with refund confirmation
- [x] My payments
- [x] Registered courses and details
- [x] Attendance summary by course
- [x] Grades list and detail, CGPA
- [x] Transcript PDF download via the proxy

### Phase 5: Instructor Dashboard
- [x] Analytics dashboard (sections, fill rate, upcoming exams, pending grading, attendance rate)
- [x] Apply as instructor, resume upload, resubmit
- [x] Profile and avatar
- [x] My sections with enrolled students
- [x] Exams: create, edit, delete, view results
- [x] Attendance: mark per section/date (bulk table)
- [x] Results: enter in bulk (upsert), edit single result

### Phase 6: Admin and Super Admin Dashboard
- [x] Analytics dashboard with semester and date filters
- [x] Student applications: list, approve (auto semester, optional section), reject with note
- [x] Instructor applications: list, approve and assign, reject
- [x] User management: filter by role/status/search, block/unblock, soft delete, role change (SUPER_ADMIN only, with the self-change and last-super-admin rules surfaced)
- [x] Academic structure CRUD: departments, programs, courses (with prerequisites), semesters (single active), course sections (assign instructor), student sections
- [x] Student controls: set current semester, assign section, update status
- [x] Enrollments (list, override status, cancel with refund)
- [x] Payments with revenue summary
- [x] Exams and results oversight

### Phase 7: Polish
- [x] `loading.tsx` skeletons for every route group
- [x] `error.tsx`, `not-found.tsx`, `global-error.tsx`
- [x] Empty states for every list
- [x] Responsive pass (tables become cards on mobile)
- [x] Accessibility pass (focus, labels, contrast)
- [x] Dark mode check
- [x] Biome lint and production build with no errors
- [ ] Deployment on Vercel with env vars, bKash callback URL verified (deploy steps documented in README; the deploy and the bKash redirect still need the live environment)

## 8. Key Implementation Notes

### Forms (Server Actions)
- One Zod schema per form, imported by both the client form and the action.
- Actions never trust client validation: always re-parse.
- Use `useActionState` for pending state, disable the submit button while pending.

### Tables
- Filters, search and page live in the URL (`?page=2&status=PENDING&searchTerm=ali`). The page is a Server Component that reads `searchParams` and fetches, so tables are shareable and SSR-first.
- Debounce the search input and use `router.replace`.

### Payments (bKash)
1. Student picks courses, `enrollAction` calls `POST /api/course-registrations/enroll`.
2. Action returns `paymentUrl`, then `redirect(paymentUrl)`.
3. bKash returns to the backend callback, which redirects to `/student/payment-result?payment=success&trxId=...&enrollmentId=...` or `?payment=failed&status=...`.
4. The result page fetches the enrollment by id (on success) and shows trx id, credits, total fee and sections. On failure it explains that the enrollment was cancelled and offers to try again.
5. Tag-revalidate `my-enrollments` and `my-payments` on arrival.

### Applications flow
- A new student sees only the apply page until approved. After approval the full dashboard unlocks.
- Same gating for instructors, plus resume upload.
- `me` returns `studentProfile` / `instructorProfile` as `null` until approved, which is the gating signal.

### Charts
- recharts only, responsive containers, colors from the design tokens.
- Admin: users, applications, enrollments, finance, attendance. Student: grade breakdown, attendance. Instructor: fill rate, attendance.

### Security
- No tokens in `localStorage` or readable cookies.
- Proxy path whitelist, size limits on uploads, same-origin only.
- Never trust the role cookie for authorization, only for UX redirects.

## 9. Private Routes, Suspense and Loading (must be perfect)

### 9.1 Private route layers (all four must exist)
1. **Route guard** (`src/proxy.ts`): no access token and a refresh token present, try refresh; neither present, redirect to `/login?next=<path>`. Logged-in users hitting auth pages go to their dashboard.
2. **Layout guard**: each role layout calls `requireRole`. Wrong role redirects to that user's own dashboard, never a blank page.
3. **Data guard**: every service call maps backend auth errors (including the 500 quirk) to a redirect or `forbidden` UI. Blocked or deleted accounts are logged out with a clear message.
4. **Gate by status**: students and instructors without an approved profile (`studentProfile` / `instructorProfile` is `null`) only reach their apply, application status and profile pages. Everything else shows a "pending approval" or "rejected, edit and resubmit" state.

Rules:
- `next` redirect target is validated (same-origin, relative path only) to prevent open redirects.
- Role-only actions (role change, delete super admin) are hidden in the UI AND re-checked in the Server Action.
- Every Server Action starts by reading the session and checking the role. Never rely on the page having been guarded.

### 9.2 Suspense and loading pattern
- Every route segment with data has a `loading.tsx` that mirrors the page layout with shadcn `Skeleton` (no spinners for page loads).
- Pages render the static shell immediately (header, filters) and wrap each data block in its own `<Suspense fallback={<XSkeleton />}>`; data components are async Server Components that fetch for themselves.
- Tables: `<Suspense key={JSON.stringify(searchParams)} fallback={<TableSkeleton />}>` so filtering and pagination show a skeleton instead of freezing.
- Dashboard cards and charts load independently, so one slow analytics call never blocks the page.
- Anything that reads `cookies()`, `headers()` or `searchParams` sits inside a Suspense boundary (required if `cacheComponents` is enabled).
- Mutations show pending state with `useActionState` / `useFormStatus` (disabled button + inline spinner) and, where it helps, `useOptimistic`.
- Each route group has `error.tsx` (with retry) and `not-found.tsx`. `global-error.tsx` at the root.
- Every list has an `EmptyState` with a next action, and every skeleton has the same dimensions as the real content to prevent layout shift.

## 10. Acceptance Criteria and Verification (agent must do this for every task)

Full rules live in `AGENTS.md` (Definition of Done). After finishing ANY task, the agent must run the checks below, report each one as pass or fail, and fix failures before moving on. A task is not done until every item for its phase passes.

### Always (every task)
- [ ] `npm run lint` (biome check) and `npm run typecheck` (tsc --noEmit) pass with zero errors
- [ ] `npm run build` succeeds
- [ ] No `any`, no unused code, no console logs
- [ ] The page works at 375px, 768px and 1280px
- [ ] Loading skeleton, empty state and error state each exist and were seen working
- [ ] Keyboard focus visible, labels on all inputs
- [ ] Uses the shared components and design tokens (no one-off colors or fonts)
- [ ] No tokens or backend URL exposed to the browser

### Phase 1: Foundation
- [ ] All shadcn components installed and the demo page renders them in both themes
- [ ] Proxy forwards GET/POST/PATCH/DELETE, multipart upload works, PDF streams
- [ ] Expired access token is refreshed once and the original request succeeds
- [ ] Backend 500 auth messages map to the right redirect/error

### Phase 2: Auth
- [ ] Register, OTP verify, login, Google login, forgot and reset password all work end to end
- [ ] Zod rules match the backend (name 3-10, strong password, 6-digit OTP)
- [ ] Each role lands on the correct dashboard after login
- [ ] Logout clears cookies; protected URLs then redirect to `/login?next=...`
- [ ] Blocked, deleted and Google-only accounts show the correct message

### Phase 3: Public
- [x] Site layout on every public and auth page; no sidebar anywhere
- [x] Metadata and Open Graph set; all images via `next/image`

### Phase 4: Student
- [ ] Each of the 4 private route layers verified (logged out, wrong role, blocked, unapproved)
- [ ] Apply, edit and resubmit works; gating states render correctly
- [ ] Enroll flow verified for success, failed payment and cancelled payment
- [ ] Prerequisite, credit-limit and no-seat errors show readable messages
- [ ] Transcript downloads as a valid PDF

### Phase 5: Instructor
- [ ] Only the instructor's own sections, exams and students appear
- [ ] Bulk attendance and bulk results save and re-load correctly

### Phase 6: Admin
- [ ] ADMIN cannot see super-admin-only controls; SUPER_ADMIN can
- [ ] Self-block, self-delete, self-role-change and last-super-admin cases show backend messages
- [ ] Approve/reject, CRUD and filters update the UI without a manual refresh (tag revalidation)

### Phase 7: Polish
- [x] Every route has `loading.tsx` and a matching skeleton
- [ ] Lighthouse accessibility 90+ on landing and one dashboard page (not run: no Chrome or Chrome launcher available in this environment)
- [ ] Production deploy tested with the real backend and bKash redirect (not run: needs Vercel and the live backend)

## 11. Success Criteria
- All flows work end to end for all four roles
- Role-based access enforced in the route guard, layouts and by the backend
- Two layouts (site and dashboard) used correctly
- All shadcn components installed and used
- Private routes protected at all four layers, Suspense and loading states on every route
- Every task verified against section 10 before it is marked done
- Server Actions for every form mutation, Server Components for reads, proxy only where needed
- `next/image` with allowed remote domains for all images
- Consistent design system and signature element used across the app
- bKash payment flow works for success, failure and cancel
- Responsive, accessible, polished UI
- No lint or build errors

---

*Refer to Api_Documentation.md for exact request and response shapes.*