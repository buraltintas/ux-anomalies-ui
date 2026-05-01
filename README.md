# UX Anomalies UI

Production-ready Next.js App Router frontend for [uxanomalies.com](https://uxanomalies.com), deployed behind a server-side BFF layer.

## Architecture

Browser/client components never call the Go backend directly.

- Browser -> Next.js routes/server components
- Next.js BFF -> Go backend (`BACKEND_API_BASE_URL`)
- Every backend call attaches `X-BFF-Secret` server-side

`BFF_SECRET` and backend tokens are never exposed to the browser.

## Required environment variables

Set these in Cloud Run (and locally via `.env.local` as needed):

```bash
NEXT_PUBLIC_APP_URL=https://uxanomalies.com
NEXTAUTH_URL=https://uxanomalies.com
AUTH_SECRET=<secret>

BACKEND_API_BASE_URL=https://api.uxanomalies.com
BFF_SECRET=<secret>

GOOGLE_CLIENT_ID=<prod-google-client-id>
GOOGLE_CLIENT_SECRET=<prod-google-client-secret>
GITHUB_CLIENT_ID=<prod-github-client-id>
GITHUB_CLIENT_SECRET=<prod-github-client-secret>

# Optional (useful behind proxies / managed ingress)
AUTH_TRUST_HOST=true

# Optional
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<google-site-verification-token>
NEXT_PUBLIC_GA_MEASUREMENT_ID=<ga-id>
BACKEND_OAUTH_SYNC_PATH=/v1/internal/auth/oauth-upsert
```

## Cloud Run deployment readiness

### Container

- Multi-stage Docker build with Node 22
- `npm ci` + `npm run build`
- Next.js standalone output enabled (`output: "standalone"`)
- Runtime starts via `node server.js`
- Listens on `PORT` (default `8080`)
- Secrets are injected at runtime via Cloud Run env vars (not baked into image)

### Build and run locally via Docker

```bash
docker build -t ux-anomalies-ui .
docker run --rm -p 8080:8080 \
  -e PORT=8080 \
  -e NEXT_PUBLIC_APP_URL=https://uxanomalies.com \
  -e NEXTAUTH_URL=https://uxanomalies.com \
  -e AUTH_SECRET=replace-me \
  -e BACKEND_API_BASE_URL=https://api.uxanomalies.com \
  -e BFF_SECRET=replace-me \
  -e GOOGLE_CLIENT_ID=replace-me \
  -e GOOGLE_CLIENT_SECRET=replace-me \
  -e GITHUB_CLIENT_ID=replace-me \
  -e GITHUB_CLIENT_SECRET=replace-me \
  ux-anomalies-ui
```

## Domain and redirect policy

Canonical domain: `https://uxanomalies.com`

`https://www.uxanomalies.com` is permanently redirected (`308`) to apex in production, preserving path and query.

Implemented in `src/middleware.ts`.

## SEO status

- Global metadata in `src/app/layout.tsx`
  - title template: `%s | UX Anomalies`
  - default title: `UX Anomalies`
  - description: `Social platform for spotting real-world UX anomalies.`
  - OpenGraph/Twitter metadata configured
  - `metadataBase` from `NEXT_PUBLIC_APP_URL`
- `src/app/robots.ts` present
  - allows `/`
  - disallows `/api/`, `/login`, `/register`, `/profile`, `/submit`
- `src/app/sitemap.ts` present (static fallback)
- `/login`, `/register`, `/profile`, `/submit` marked `noindex, nofollow`
- Manifest and icons are available via App Router metadata files

## OAuth production checklist

In Google and GitHub OAuth console/apps, add production callback URL:

- `https://uxanomalies.com/api/auth/callback/google`
- `https://uxanomalies.com/api/auth/callback/github`

Also add the apex site URL/origin where required by provider settings.

## Development

```bash
npm run dev
npm run lint
npm run build -- --webpack
```
