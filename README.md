# vanilla-light
[![npm version](https://img.shields.io/npm/v/vanilla-light.svg)](https://www.npmjs.com/package/vanilla-light)
[![npm downloads](https://img.shields.io/npm/dm/enigmatic.svg)](https://www.npmjs.com/package/enigmatic)

Vanilla-light is a no-build, dependency-free full-stack framework with a reactive browser client and an HTTPS server.
It is designed for a split deployment model: static frontend on CDN + API backend on Bun, with built-in plugins for auth, database/storage, and LLM proxy routes.

- no frontend build step
- no runtime npm dependencies
- standalone front and back-end (can be separately hosted)
- reactive `window.state` + custom web components
- plugin-driven backend (`src/plugins/*`)
- auth (auth0, bearer) | db (jsonl) | llm (openrouter)

Client import ([`client.js` exports](#clientjs-exports)):
```js
import { $, $$, get, set, del, me } from 'https://unpkg.com/vanilla-light'
```

```text
Browser (CDN/Static)                     HTTPS Server (API)
tiny js client + components + html      <-> server + plugins
```

![Client/server architecture](https://i.ibb.co/hJL6dMqn/clientserver.png)

This project splits into:
- Browser/static layer: `public/index.html`, `public/client.js`, `public/components.js`
- Bun backend: `src/server.js` + `src/plugins/*` (auth, storage, llm)
- Communication: browser <-> backend API calls

## Quick Start
```bash
bun install
bun run hot
# or
bun run start
```
Default server URL: `https://localhost:3000`

Set `disable_ssl: true` in `config.json` to run plain HTTP (`http://localhost:3000`) instead of HTTPS. This is useful behind a reverse proxy (nginx/caddy/cloudflare) that terminates HTTPS.

## Layout
- `src/server.js`: server + route dispatch
- `src/plugins/`: `always`, `auth`, `storage`, `llm`
- `public/client.js`: browser API
- `public/components.js`: exported `components` registry
- `public/index.html`: full demo
- `test/server.sh`: integration smoke tests

## Deployment Model
Run frontend and backend separately:
- Backend: Bun server (`src/server.js`)
- Frontend: static/CDN host (`client.js`, `components.js`, HTML)

Client-side requirement:
```js
import { $, $$, get, set, del, me } from 'https://unpkg.com/vanilla-light'
```

Example backend config for reverse-proxy TLS termination:
```json
{ "disable_ssl": true }
```

## Required Env (current config)
```bash
AUTH0_DOMAIN=...
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
CLOUDFLARE_ACCESS_KEY_ID=...
CLOUDFLARE_SECRET_ACCESS_KEY=...
CLOUDFLARE_BUCKET_NAME=...
CLOUDFLARE_PUBLIC_URL=...
OPENROUTER_API_KEY=...
```

## Auth Modes
```text
[Auth0 redirect] loginAuth0() / logoutAuth0()
[Bearer API]    registerBearer(email, name?, sub?) / loginBearer(sub) / logoutBearer()
```
`login()` -> Auth0 login  
`logout()` -> bearer logout if token exists, else Auth0 logout

## API Behavior
```text
POST   /register    -> { token, user }
POST   /login       -> { token, user }
GET    /me          -> user or not found
POST   /{key}       -> { "POST":"ok" }            (kv set, auth)
GET    /{key}       -> stored value | null        (kv get, auth)
DELETE /{key}       -> { "DELETE":"ok" }          (kv delete, auth)
PUT    /{key}       -> { status:"Saved to R2" }   (s3 upload, auth)
PROPFIND /          -> [ ...files ]               (s3 list, auth)
PATCH  /{key}       -> file stream                (s3 download, auth)
POST   /llm/chat    -> OpenRouter proxy
```
Unauthorized KV/S3 response:
```json
{ "error": "Unauthorized" }
```

## Writing a Server Plugin
File: `src/plugins/<group>/<name>.js`

```js
import { json, redir } from '../src/server.js'

export default function plugin(app) {
  app.routes = {
    ...app.routes,
    'GET /hello': async (req) => json({ hello: 'world', user: req.user?.sub || null }),
    'GET /go-home': async () => redir('/')
  }
}
```

Rules:
- Export one `default function(app)`
- Route keys: `'GET /path'`, `'POST /path'`, `'GET *'`, etc.
- Use `req` (not `_req`) and avoid `ctx` in plugins
- Import `json`/`redir` from `src/server.js` for responses
- Return `null` to pass to next handler
- Append required envs to `app.requiredEnvs`
- Enable plugin in `config.json`

## Writing Custom Web Components
Define in `public/components.js`:
```js
export const components = {
  'hello-card': (data) => `<div>Hello ${data || 'world'}</div>`,
  'user-badge': {
    render: async () => {
      const u = await window.me()
      return `<b>${u?.name || 'guest'}</b>`
    }
  }
}
```

Use in HTML:
```html
<hello-card data="name"></hello-card>
<user-badge></user-badge>
<script>window.state.name = 'Chris'</script>
```

## `window.state` Reactivity
`window.state` is a `Proxy`.

```text
window.state.count = 1
-> proxy set(...)
-> find [data="count"]
-> render matching window.components[tag]
```

Example:
```html
<counter-view data="count"></counter-view>
<script>
  window.components['counter-view'] = (v) => `<div>${v}</div>`
  window.state.count = 1
</script>
```

Notes:
- Updates are key-based (`data="key"`)
- Only registered custom tags render
- New nodes auto-init via `MutationObserver`

## `client.js` Exports
Available imports from `https://unpkg.com/vanilla-light`:
- DOM: `$`, `$$`, `$c`
- KV/storage-ish helpers: `get`, `set`, `put`, `del`, `purge`, `list`, `download`
- Generic HTTP helper: `fetchJson`
- User/auth helpers: `me`, `login`, `logout`, `loginAuth0`, `logoutAuth0`, `registerBearer`, `loginBearer`, `logoutBearer`
- Reactivity/components: `state`, `initComponents`

## Tests
Run with server up:
```bash
bash test/server.sh
# optional
BASE=https://localhost:3000 bash test/server.sh
```
