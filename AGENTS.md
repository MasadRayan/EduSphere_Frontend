<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md - Housely Frontend

## Development Principles

- **Build incrementally**: Don't build big changes at once. Always build one small feature at a time, then test it thoroughly before moving to the next.
- **Test after each change**: After implementing any feature, test it in the browser/dev environment. Verify it works correctly before proceeding.
- **Small, focused commits**: Keep changes minimal and focused on a single feature/fix.
- **Type safety first**: Use TypeScript properly. Follow existing codebase patterns.
- **Follow plan.md**: Refer to the implementation plan in plan.md for the roadmap. Work through phases sequentially.
- **Quality checks**: Run `npm run lint` and `npm run build` after significant changes to catch issues early.
- **Iterate until correct**: If something doesn't work as expected, don't proceed blindly. Debug, fix, and re-test until the feature works correctly before moving on.

## Design & UI Principles

- **Custom, not generic**: The UI should be robust and well-matched to the Housely property rental concept. It must NOT look like any generic template.
- **Purposeful design**: Every component and layout should serve the rental/tenancy workflow with clear hierarchy and intent.
- **Visual identity**: Create a distinct visual language (colors, typography, spacing, borders, shadows) that feels tailored to real estate/property management - professional, trustworthy, and modern.
- **Cohesive system**: Maintain consistency in spacing, radius, elevation, and interaction patterns throughout the app.
- **Polish details**: Focus on thoughtful micro-interactions, proper empty/loading states, and accessible color contrast.
- **Avoid template aesthetics**: Don't default to overused boilerplate styles. Customize shadcn/ui theme tokens to match the Housely brand identity.

## Code Conventions

- Use the App Router (Next.js 16.4) patterns - check `node_modules/next/dist/docs/` for latest conventions.
- Follow existing code style (Biome is configured).
- Prefer functional components with TypeScript.
- Keep components small and reusable.
- Use proper error handling and loading states.
- **Loading States**: Use `loading.tsx` files in route segments where data fetching or async operations may cause delay to improve perceived performance and reduce idleness.
- **Form Handling**: Use Server Actions for form submissions. Keep forms as Server Components where possible, or use Server Actions with form actions.
- **Server/Client Components**: Always prefer Server-Side Rendering (SSR). Only use Client Components (`"use client"`) when absolutely necessary (interactivity, browser APIs, state). If you need a small interactive part, extract it as a separate Client Component and import it into a Server Component page/layout.
- **UI Components**: Use shadcn/ui with Radix UI primitives and Tailwind CSS v4. Follow shadcn's component patterns and conventions. Customize theme tokens to create a unique look.
- **Component Location**: Place shadcn/ui components in `src/components/ui/` and custom components in `src/components/shared/` or feature-specific folders.
