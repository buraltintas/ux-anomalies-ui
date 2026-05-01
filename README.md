# UX Anomalies UI Foundation

Production-ready frontend foundation for `uxanomalies.com` using Next.js App Router, TypeScript, Tailwind CSS, TanStack Query, and NextAuth OAuth.

## Required environment variables

Create `.env.local`:

```bash
BACKEND_API_BASE_URL=https://api.uxanomalies.com
BFF_SECRET=your_server_only_bff_secret
NEXT_PUBLIC_APP_URL=https://uxanomalies.com

AUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://uxanomalies.com

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Optional override (default is already /v1/internal/auth/oauth-upsert)
BACKEND_OAUTH_SYNC_PATH=/v1/internal/auth/oauth-upsert
```

## Security architecture

Browser/client components never call the Go backend directly.

Flow:

- Browser -> Next.js route handlers / server components
- Next.js server-side API client -> Go backend (`https://api.uxanomalies.com`)
- Every backend request attaches server-side header:
  - `X-BFF-Secret: process.env.BFF_SECRET`

`BFF_SECRET` is never exposed in client-side code.

## OAuth handshake with backend

OAuth authentication with Google/GitHub is performed by NextAuth. During server-side callbacks, frontend syncs the OAuth identity to the Go backend before user session is considered valid for app actions.

- Sync function: `src/lib/api/auth-server.ts`
- Sync endpoint path:
  - default: `/v1/internal/auth/oauth-upsert`
  - override: `BACKEND_OAUTH_SYNC_PATH`

Exact request sent to backend:

```json
{
  "provider": "google | github",
  "provider_user_id": "provider account id",
  "email": "user email",
  "verified_email": true,
  "name": "display name",
  "avatar_url": "profile image url"
}
```

Verification source:

- Google: read from provider profile (`email_verified`).
- GitHub: basic profile may not include a reliable verified-email flag; when unavailable, frontend sends no verified flag and backend policy decides whether to reject or perform server-side email verification lookup.

Expected backend response shape:

```json
{
  "user": {
    "user_id": "...",
    "email": "...",
    "nickname": "...",
    "avatar_url": "..."
  },
  "token": "..."
}
```

Response mapping used by frontend:

- `user.user_id -> appUserId`
- `user.nickname -> nickname`
- `user.avatar_url -> avatarUrl`
- `token -> backendAccessToken` (JWT/server context only)
- `role -> "user"` (default when backend does not return role)

If provider OAuth succeeds but backend sync fails, sign-in is rejected and user is redirected to `/login?error=BackendSyncFailed`.

## Protected BFF calls and user identity

For protected backend operations, use server-side helpers only:

- `getBackendUserContextFromRequest()` from `src/lib/auth/server-auth.ts`
- `backendProtectedRequest()` from `src/lib/api/server.ts`

This attaches user identity to backend calls in addition to `X-BFF-Secret`:

- `X-App-User-Id: <appUserId>`
- `Authorization: Bearer <backendAccessToken>` when backend token exists

`backendAccessToken` is kept out of client session payload and is read from server-side JWT context only.
No auth secrets/tokens are stored in `localStorage`.

## Implemented routes

- `/` Feed scaffold with loading/error/empty states
- `/anomalies/[slug]` Detail page scaffold
- `/login` OAuth login page (Google + GitHub)
- `/register` redirects to `/login`
- `/profile` session-protected page mapped to backend identity fields
- `/submit` submit flow placeholder
- `/api/auth/me` session-to-backend identity debug route

## Auth implementation

- NextAuth route handler at `src/app/api/auth/[...nextauth]/route.ts`
- Providers:
  - Google
  - GitHub
- Session-aware nav (login/logout/profile)
- Protected UI actions route unauthenticated users to `/login?next=...`

## Backend integration TODO

- Confirm whether backend should return role in OAuth upsert response; if added, map it instead of using frontend default `"user"`.

## Development

```bash
npm run dev
npm run lint
npm run build -- --webpack
```
