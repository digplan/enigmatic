# vanilla-light

[![npm version](https://img.shields.io/npm/v/vanilla-light.svg)](https://www.npmjs.com/package/vanilla-light)
[![npm downloads](https://img.shields.io/npm/dm/vanilla-light.svg)](https://www.npmjs.com/package/vanilla-light)

```text
+--------------------------------------------------------------+
| VANILLA-LIGHT                                                |
| Lightweight browser utilities + Bun backend plugins          |
+--------------------------------------------------------------+
```

```text
      Browser (CDN / Static)              Bun Server (API)
   +--------------------------+       +--------------------------+
   | public/client.js         | <---> | src/server/server.js     |
   | public/custom.js         |       | src/plugins/*            |
   | your HTML app            |       | auth + kv + s3 + llm     |
   +--------------------------+       +--------------------------+
```

## + quick start

```bash
bun install
bun run hot
# or
bun run start
```

server default: `https://localhost:3000`

## + layout

- `src/server/server.js` : server + route dispatch
- `src/plugins/` : `always`, `auth`, `db`, `llm`
- `public/client.js` : browser API
- `public/custom.js` : `window.custom` components
- `public/index.html` : simple full demo
- `test/server.sh` : integration smoke tests

## + deployment model

run frontend and backend separately:

- backend: Bun server (`src/server/server.js`)
- frontend: static/CDN host (`client.js`, `custom.js`, HTML)

only requirement on client side is:

```html
<script src="https://cdn.example.com/client.js"></script>
<script src="https://cdn.example.com/custom.js"></script>
<script>
  window.api_url = "https://api.example.com";
</script>
```

## + required env (with current config)

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

## + auth modes

```text
[Auth0 redirect]
  loginAuth0() / logoutAuth0()

[Bearer API]
  registerBearer(email, name?, sub?)
  loginBearer(sub)
  logoutBearer()
```

`login()` -> Auth0 login

`logout()` -> bearer logout if token exists, else Auth0 logout

## + api behavior

```text
POST   /register   -> { token, user }
POST   /login      -> { token, user }
GET    /me         -> user or not found

POST   /{key}      -> { "POST":"ok" }          (kv set, auth)
GET    /{key}      -> stored value | null         (kv get, auth)
DELETE /{key}      -> { "DELETE":"ok" }        (kv delete, auth)

PUT    /{key}      -> { status:"Saved to R2" }   (s3 upload, auth)
PROPFIND /         -> [ ...files ]                (s3 list, auth)
PATCH  /{key}      -> file stream                 (s3 download, auth)

POST   /llm/chat   -> OpenRouter proxy
```

unauthorized KV/S3 requests return:

```json
{ "error": "Unauthorized" }
```

## + writing a server plugin

file: `src/plugins/<group>/<name>.js`

```js
export default function (app) {
  const k = "GET /hello";
  const fn = async (_req, ctx) => ctx.json({ hello: "world" });
  app.routes[k] = app.routes[k]
    ? (Array.isArray(app.routes[k]) ? [...app.routes[k], fn] : [app.routes[k], fn])
    : fn;
}
```

rules:

- export one `default function(app)`
- route keys: `"GET /path"`, `"POST /path"`, `"GET *"`, etc.
- return `ctx.json(...)` or `Response`
- return `null` to pass to next handler
- append required envs to `app.requiredEnvs`
- enable plugin in `config.json`

## + writing custom web components (window.custom)

define in `public/custom.js`:

```js
window.custom = {
  "hello-card": (data) => `<div>Hello ${data || "world"}</div>`,
  "user-badge": {
    render: async () => {
      const u = await window.me();
      return `<b>${u?.name || "guest"}</b>`;
    }
  }
};
```

use in HTML:

```html
<hello-card data="name"></hello-card>
<user-badge></user-badge>
<script>window.state.name = "Chris";</script>
```

## + window.state reactivity

`window.state` is a `Proxy`.

```text
window.state.count = 1
   -> proxy set(...)
   -> find [data="count"]
   -> render matching window.custom[tag]
```

example:

```html
<counter-view data="count"></counter-view>
<script>
  window.custom["counter-view"] = (v) => `<div>${v}</div>`;
  window.state.count = 1;
</script>
```

notes:

- updates are key-based (`data="key"`)
- only registered custom tags render
- new nodes auto-init via `MutationObserver`

## + tests

run with server up:

```bash
bash test/server.sh
# optional
BASE=https://localhost:3000 bash test/server.sh
```

```text
+--------------------+
| End of README      |
+--------------------+
```
