# `src/server.js`

## Purpose

`src/server.js` is the Bun server entrypoint and runtime router. It:

- loads config (`~/.vanilla-light/config.json` first, then local `config.json`)
- loads configured plugins into a shared `app` object
- validates required environment variables declared by plugins
- preloads static files from `public/`
- creates and returns a Bun server object (`createServer`)
- optionally starts the server when run directly

## Exports

- `createServer(options = {})`
- `warnMissingTlsFiles()`
- default export: `createServer`

## Config Resolution

Load order:

1. `~/.vanilla-light/config.json`
2. `<repo>/config.json`

If no valid config exists, it uses `{}`.

Important config keys used here:

- `use_plugins`: list of plugin module paths
- `certs_dir`: cert/key directory (default `certs`)
- `disable_ssl`: when `true`, starts HTTP and skips TLS config

## Plugin Runtime Shape

`app` is passed to every plugin:

- `app.path`: repo root path
- `app.routes`: route table (`"METHOD /path"`, `"METHOD *"`, `"*"`), plus `always`
- `app.requiredEnvs`: env vars required by plugins
- `app.getUserFns`: auth resolution hooks

## Request Flow (`fetch`)

1. Handle `OPTIONS` CORS preflight.
2. Run `app.routes.always` handlers.
3. Resolve auth by calling each `app.getUserFns`.
4. Build `ctx` (`req`, `method`, `path`, `key`, `url`, `origin`, `token`, `user`, `json`, `redir`).
5. Route match order:
   - exact: `"METHOD /path"`
   - method wildcard: `"METHOD *"`
   - catch-all: `"*"`
6. If no route returns a response, serve static file from `public/`.
7. If not found, return `404` JSON.

## TLS / Startup

- TLS files expected under `<certs_dir>/cert.pem` and `<certs_dir>/key.pem`.
- `warnMissingTlsFiles()` logs missing cert/key warnings.
- when executed as main module, it starts with `Bun.serve(createServer())`.

