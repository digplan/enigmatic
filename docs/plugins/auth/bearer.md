# `src/plugins/auth/bearer.js`

## Purpose

Implements simple bearer-token auth with in-memory users and sessions.

## Exports

- `getBearerUser(req, sessions)`
- default plugin registration function

## Session Model

- users map: `app.users` keyed by `sub`
- sessions map: `app.sessions` keyed by bearer token
- extends `app.getUserFns` to resolve auth from `Authorization: Bearer <token>`

## Routes

- `POST /register`
  - creates user (uses provided `sub` or random UUID)
  - creates bearer token
  - returns `{ token, user }`
- `POST /login`
  - looks up user by `sub`
  - returns new token + user or `404` if not found
- `GET /me`
  - returns resolved user if authenticated
  - otherwise returns `null` for fallback
- `GET /logout`
  - deletes current bearer token from session map
  - returns `{ status: "Logged out" }`

## Notes

- in-memory only; sessions/users reset on process restart
- intended for lightweight/local auth flows

