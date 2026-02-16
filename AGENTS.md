# Repository Guidelines

## Project Structure & Module Organization
Core code lives under `src/`.
- `src/`: Bun server entry point (`server.js`) and server utilities.
- `src/plugins/`: pluggable features by domain (`auth/`, `storage/`, `llm/`).
- `src/client/`: browser-side custom element helpers.
- `public/`: static files served by the server (`index.html`, `client.js`, `components.js`).
- `data/`: local JSONL data files used by storage plugins.
- `test/`: shell-based API smoke tests (`test/server.sh`).
- `bin/start.js`: CLI entrypoint.

## Build, Test, and Development Commands
- `bun install`: install dependencies.
- `bun run start` (or `npm start`): run server using `src/server.js`.
- `bun run hot` (or `npm run hot`): run server with Bun hot reload.
- `bun run bin/start.js --port 3000`: run via CLI entrypoint.
- `bash test/server.sh`: run curl smoke tests against `https://localhost:3000`.
  Example with custom target: `BASE=https://localhost:4000 bash test/server.sh`.

## Coding Style & Naming Conventions
Use modern JavaScript with ESM (`import`/`export`) and keep code simple and framework-free.
- Indentation: 2 spaces.
- Prefer descriptive, small functions and early returns in handlers.
- Naming: `camelCase` for variables/functions, `PascalCase` for constructors, `kebab-case` for files.
- Keep plugin files focused by capability (for example `src/plugins/auth/bearer.js`).
- Match surrounding quote/semicolon style in touched files; avoid unrelated formatting churn.

## Testing Guidelines
There is no formal unit-test framework yet; current validation is integration-style via curl.
- Add or extend scenarios in `test/server.sh` when changing routes/auth/storage behavior.
- Keep tests deterministic and status-code focused.
- For API changes, include at least one success case and one failure/unauthorized case.

## Commit & Pull Request Guidelines
Recent history favors short, imperative commit subjects (for example `Refactor`, `fix`), with occasional longer explanatory commits.
- Prefer: concise imperative subject, optionally scoped (for example `auth: validate bearer token`).
- Keep commits focused to one concern.
- PRs should include: purpose, behavior changes, test evidence (command + result), and related issue/context.
- Include request/response examples or screenshots when UI/API output changes.

## Security & Configuration Tips
- Configure runtime behavior in `config.json` (`use_plugins`, `port`).
- Keep secrets in environment variables; never commit credentials.
- TLS certs are expected in `certs/` for HTTPS local/prod flows.
