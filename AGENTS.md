<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md - EduSphere Frontend

Read `planning.md` first. It says WHAT to build, phase by phase. This file says HOW to work and when a task counts as done. Request/response shapes are in `Api_Documentation.md`.

## Development Principles

- **Build incrementally**: One small feature at a time. Test it in the browser before starting the next.
- **Follow planning.md**: Work through the phases in order. Do not jump ahead.
- **Small, focused commits**: One feature or fix per commit, with a clear message.
- **Type safety first**: Strict TypeScript, no `any`. Follow existing codebase patterns instead of inventing new ones.
- **Iterate until correct**: If something fails, debug and re-test. Never move on with a known failure.
- **Check the docs first**: Next.js conventions may differ from your training data (for example the route guard file is `proxy.ts` instead of `middleware.ts` on newer versions). Read `node_modules/next/dist/docs/` before using any Next.js API.

## Architecture Rules

- **Reads**: Server Components via `lib/api/server-fetch.ts`.
- **Mutations**: Server Actions only. Layering per feature: Zod schema -> service -> action -> UI. Actions return `ActionResult`.
- **Browser-side calls** (TanStack Query, uploads, PDF download): only through `/api/proxy/*`. Never call the backend URL from client code.
- **Secrets**: backend URL is `API_URL` (server-only). Tokens live only in httpOnly cookies.
- **Layouts**: exactly two visible layouts, `(site)` and `(dashboard)`, under a root layout that only holds fonts and providers. Never add chrome to the root layout.
- **Private routes**: all four layers from `planning.md` section 9.1 (route guard, layout guard, data guard, approval gating). Every Server Action re-checks session and role itself.
- **Images**: always `next/image`. Add any new remote host to `next.config.ts` first.

## Design & UI Principles

- **Custom, not generic**: EduSphere must not look like a template. Follow the design system in `planning.md` section 6 (tokens, fonts, status colors, course code tag signature).
- **Purposeful**: every screen serves the academic workflow (apply, enroll, pay, attend, grade) with clear hierarchy.
- **Cohesive system**: consistent spacing, radius, elevation and interaction patterns. No one-off colors or fonts.
- **shadcn first**: all shadcn components are installed. Compose from them before writing custom components, and customize theme tokens rather than overriding styles ad hoc.
- **Polish**: thoughtful empty, loading and error states, accessible contrast, visible keyboard focus, `prefers-reduced-motion` respected.
- **Copy**: sentence case, active verbs, one name per action across button, toast and dialog. Errors say what happened and what to do next.

## Code Conventions

- App Router patterns for the installed Next.js version, with Biome for lint and format.
- Functional components with TypeScript. Keep components small and reusable.
- **SSR first**: use `"use client"` only for interactivity, browser APIs or state. Extract the small interactive piece as a Client Component and import it into a Server Component page or layout.
- **Forms**: Server Actions. Keep forms as Server Components where possible, otherwise `useActionState` with React Hook Form and the shared Zod schema.
- **Loading**: every route segment with async data has `loading.tsx` with a skeleton that matches the real layout. Wrap data blocks in `<Suspense>`, and key table Suspense boundaries by `searchParams`.
- **Errors**: `error.tsx` and `not-found.tsx` per route group, `global-error.tsx` at the root.
- **Component location**: shadcn components in `src/components/ui/`, shared pieces in `src/components/shared/`, feature pieces in `src/components/<feature>/`.
- Server-only modules start with `import "server-only"`.
- No em dashes in code comments, copy or docs. Use normal hyphens.

## Workflow for Every Task

1. Restate the task and the matching acceptance criteria from `planning.md` section 10.
2. Implement it with the existing patterns.
3. Run the Definition of Done below.
4. Report the result as a checklist, pass or fail per item. Fix every fail and re-run before saying the task is done.
5. Tick the item in `planning.md`.

## Definition of Done (run every time)

1. `npm run lint` has zero errors.
2. `npx tsc --noEmit` has zero errors.
3. `npm run build` succeeds.
4. Manual run in the browser against the backend:
   - happy path works
   - validation errors show under the fields
   - backend errors show a readable message
   - loading skeleton, empty state and error state were each seen
5. Access checks for any private page:
   - logged out redirects to `/login?next=...`
   - wrong role redirects to the user's own dashboard
   - blocked or deleted user is logged out with a message
   - unapproved student or instructor sees the gated state
6. Responsive check at 375px, 768px and 1280px, in light and dark theme.
7. Accessibility: keyboard reachable, visible focus, labels on inputs, dialogs trap focus.
8. No `any`, dead code, console logs, secrets or tokens in client code.
9. Network tab: no direct backend URL and no tokens in anything sent to the browser.

If a check cannot be run (for example the backend is down), say so explicitly. Never mark it as passed.

## Do Not

- Do not skip a failing check or loosen lint or TypeScript rules to pass.
- Do not add dependencies that duplicate an existing one (ofetch, zod, React Hook Form, TanStack Query, recharts).
- Do not put business logic in components.
- Do not rely on hiding a control in the UI as authorization.