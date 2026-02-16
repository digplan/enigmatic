# vanilla-light
[![npm version](https://img.shields.io/npm/v/vanilla-light.svg)](https://www.npmjs.com/package/vanilla-light)
[![npm downloads](https://img.shields.io/npm/dm/enigmatic.svg)](https://www.npmjs.com/package/enigmatic)

Vanilla-light is a no-build, dependency-free full-stack framework with a reactive browser client and an HTTPS Bun server.
It is designed for split deployment: static frontend on CDN + API backend with plugin-driven routes.

- no frontend build step
- no runtime npm dependencies
- standalone frontend/backend deployment
- reactive `window.state` + custom web components
- plugin-driven backend (`src/plugins/*`)
- auth (auth0, bearer) | db (jsonl) | llm (openrouter)

## Quick Start
```bash
bun run hot
# or
bun run start
```
Default server URL: `https://localhost:3000`

`bun install` is not needed for this project right now because it has no runtime npm dependencies.

To run HTTP instead of HTTPS, set `disable_ssl: true` in config.

## CLI
Run commands with any of these:
```bash
bun bin/cli.js <command>
npx vanilla-light <command>
vlserver <command>
```

Common commands:
```bash
vlserver start
vlserver config
vlserver port 3000
vlserver insecure true
vlserver insecure false
vlserver certsdir certs
vlserver +plugin auth/bearer.js
vlserver -plugin auth/bearer.js
```

Notes:
- `vlserver config` prints active config path + config JSON
- `+plugin` errors if plugin file does not exist under `src/plugins`
- `certsdir` errors if the directory does not exist

## Configuration
Default config shape:
```json
{
  "use_plugins": [],
  "port": 3000,
  "disable_ssl": false,
  "certs_dir": "certs"
}
```

Config resolution order:
1. `~/.vanilla-light/config.json`
2. `./config.json`
3. built-in defaults

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

Client import:
```js
import { $, $$, get, set, del, me } from 'https://unpkg.com/vanilla-light'
```

Reverse-proxy TLS termination example:
```json
{ "disable_ssl": true }
```

![Client/server architecture](https://i.ibb.co/hJL6dMqn/clientserver.png)

## Required Env (Current Plugins)
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

## API Overview
Main routes:
- `POST /register`, `POST /login`, `GET /me`
- KV: `POST/GET/DELETE /{key}`
- Storage: `PUT /{key}`, `PROPFIND /`, `PATCH /{key}`
- LLM: `POST /llm/chat`

For full behavior details, see `docs/server.md`.

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
- KV/storage helpers: `get`, `set`, `put`, `del`, `purge`, `list`, `download`
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
