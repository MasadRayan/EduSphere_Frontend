# EduSphere Frontend

Next.js (App Router) frontend for EduSphere, a university management platform.
Reads happen in Server Components, mutations in Server Actions, and everything
that must run in the browser goes through the `/api/proxy` route handler. The
REST backend is a separate service; only the server knows its URL.

## Requirements

- Node.js 20+
- The EduSphere backend running and reachable
- A Google OAuth client ID if you want Google sign-in

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` from the template and fill it in:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Scope | Purpose |
   | --- | --- | --- |
   | `API_URL` | server only | Base URL of the backend, for example `http://localhost:8000` |
   | `NEXT_PUBLIC_APP_URL` | public | Public origin of this app, used for redirects and metadata |
   | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | public | Google OAuth client ID for the sign-in button |

   `API_URL` must never be prefixed with `NEXT_PUBLIC_`, and it is never sent to
   the browser. Access and refresh tokens live only in httpOnly cookies.

3. Start the dev server:

   ```bash
   npm run dev
   ```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Biome check |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Biome format and write |

## Deployment on Vercel

1. Import the repository at [vercel.com/new](https://vercel.com/new). The
   framework preset is detected automatically.

2. Set the environment variables in the Vercel project (Production and Preview):

   ```env
   API_URL=https://edusphere-backend-snowy.vercel.app
   NEXT_PUBLIC_APP_URL=https://<your-frontend-domain>
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-client-id>
   ```

   Mark `API_URL` as a server variable only. Do not mark `NEXT_PUBLIC_*` as
   sensitive, they are shipped to the browser by design.

3. Deploy. Confirm `npm run build` passed locally first; the same command runs
   on Vercel.

### bKash callback

bKash returns to the backend callback, which then redirects the browser to the
payment result page. The backend must point its `FRONTEND_URL` at the deployed
origin plus `/student/payment-result`, for example:

```env
# On the backend service
FRONTEND_URL=https://<your-frontend-domain>/student/payment-result
```

Verify after deploying:

1. Enroll as a student and start a payment.
2. Complete or cancel the bKash flow.
3. You should land on `/student/payment-result?payment=success&trxId=...` or
   `?payment=failed&status=...` and see the matching state.

For local testing, set the backend `FRONTEND_URL` to
`http://localhost:3000/student/payment-result`.

### Remote images

Avatars and Google profile photos are loaded with `next/image`. Their hosts are
allowed in `next.config.ts`. If the backend starts returning a new image host,
add it to `images.remotePatterns` before using it.

## Project structure

```
src/
  app/                 routes, grouped as (site) and (dashboard)
  actions/             Server Actions per feature
  services/            backend calls, server only
  components/          ui (shadcn), shared, charts, per feature
  lib/                 api, auth, validations, utils
  hooks/               TanStack Query hooks
  types/               api, entities, enums
```

See `planning.md` for the phased plan and `AGENTS.md` for the working rules and
the definition of done.
