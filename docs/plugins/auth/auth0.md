# `src/plugins/auth/auth0.js`

## Purpose

Implements Auth0 login using OAuth authorization code flow and cookie-based sessions.

## Required Env

- `AUTH0_DOMAIN`
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`

If any are missing, routes are not activated.

## Session Model

- session token is stored in `token` cookie
- in-memory map `app.oauthSessions` stores user profiles by token
- `app.getUserFns` is extended to resolve `{ token, user }` from cookie

## Routes

- `GET /login`
  - redirects to Auth0 `/authorize`
  - includes `state` with referrer/origin
- `GET /callback`
  - exchanges `code` for tokens
  - fetches `/userinfo`
  - stores user in session map
  - sets secure cookie and redirects back to `state`
- `GET /me`
  - returns current user when Auth0 session is present
  - otherwise returns `null` to allow other auth plugins to handle
- `GET /logout`
  - clears in-memory session for current token
  - expires cookie and redirects to origin

## Notes

- cookie is set as `HttpOnly`, `Secure`, `SameSite=None`
- session storage is in-memory only (not persistent across restarts)

