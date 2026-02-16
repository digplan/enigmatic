import { dirname, extname, join } from "node:path";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { readdir, readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

// Resolve the project root in both normal and compiled Bun execution modes.
function resolveAppPath() {
  const compiled = import.meta.path.startsWith("/$bunfs/");
  if (!compiled) return import.meta.path.split("/src")[0];

  const exeDir = dirname(process.execPath);
  const candidates = [
    process.cwd(),
    join(exeDir, ".."),
    exeDir,
  ];

  for (const base of candidates) {
    if (existsSync(join(base, "public"))) return base;
  }

  return process.cwd();
}

const appPath = resolveAppPath();

// Load config from user home first, then local project config as fallback.
async function loadConfig() {
  const homeConfigPath = join(homedir(), ".vanilla-light", "config.json");
  const candidates = [
    homeConfigPath,
    join(appPath, "config.json"),
  ];

  for (const file of candidates) {
    if (!existsSync(file)) continue;
    try {
      const parsed = JSON.parse(await readFile(file, "utf8"));
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return { config: parsed, configPath: file };
      }
      console.warn(`[warning] Ignoring invalid config at ${file}`);
    } catch (e) {
      console.warn(`[warning] Failed to parse config at ${file}: ${e.message}`);
    }
  }

  return { config: {}, configPath: null };
}

const { config, configPath } = await loadConfig();
const certsDir = typeof config.certs_dir === "string" && config.certs_dir.trim() ? config.certs_dir.trim() : "certs";
const disableSsl = config.disable_ssl === true;

// Shared app state that plugins mutate (routes, auth hooks, required envs, etc).
const app = { 
  path: appPath,
  routes: { always: [] },
  requiredEnvs: [],
  getUserFns: []
};

// Load each configured plugin module and let it register behavior into app.
for (const name of config.use_plugins || []) {
  try {
    const pluginPath = name.startsWith("/") ? name : join(app.path, "src", "plugins", name);
    const mod = await import(pathToFileURL(pluginPath).href);
    if (typeof mod.default === "function") await mod.default(app);
  } catch (e) {
    console.error(`Failed to load plugin ${name}: ${e.message}`);
  }
}

// Fail fast when required env vars are missing.
const required = [
  ...(Array.isArray(app.requiredEnv) ? app.requiredEnv : []),
];
const missing = [...new Set(required)].filter((k) => !Bun.env[k]);
if (missing.length) throw new Error(`Missing env: ${missing.join(", ")}`);

// Static files (cached in memory)
const files = {};
for (const f of await readdir(join(app.path, "public"))) files[`/${f}`] = await readFile(join(app.path, "public", f));

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

const cors = (o) => ({
  "Access-Control-Allow-Origin": o || "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PURGE, PROPFIND, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
  "Access-Control-Allow-Credentials": "true",
});

export const redir = (url, cookie) =>
  new Response(null, {
    status: 302,
    headers: {
      Location: url,
      ...(cookie ? { "Set-Cookie": cookie } : {}),
    },
  });

// JSON helper with support for status-only responses (e.g. json(204)).
export function json(d, s = 200, h = {}) {
  if (typeof d === "number" && s === 200 && Object.keys(h).length === 0) {
    return new Response(null, { status: d });
  }

  if (d === undefined) {
    return new Response(null, {
      status: s,
      headers: h,
    });
  }

  return new Response(JSON.stringify(d), {
    status: s,
    headers: { "Content-Type": "application/json", ...h },
  });
}

export function createServer(options = {}) {
  const server = {
    port: options.port ?? 3000,
    async fetch(req) {
      const url = new URL(req.url), path = url.pathname, key = path.slice(1), origin = req.headers.get("Origin") || url.origin;
      if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });

      // Global middleware-like hooks that always run.
      for (const fn of app.routes.always || []) fn(req, null, null);

      // First auth plugin that returns token/user wins.
      let auth = { token: null, user: null };
      for (const getUser of app.getUserFns || []) {
        const out = getUser(req);
        if (out?.token || out?.user) {
          auth = out;
          break;
        }
      }

      const toJson = (d, s = 200, h = {}) =>
        json(d, s, { ...cors(origin), ...h });
      const ctx = { req, method: req.method, path, key, url, origin, token: auth.token, user: auth.user, json: toJson, redir };

      // Route resolution order: exact -> method wildcard -> global wildcard.
      for (const k of [`${req.method} ${path}`, `${req.method} *`, "*"]) {
        const list = Array.isArray(app.routes[k]) ? app.routes[k] : [app.routes[k]];
        for (const fn of list) {
          if (typeof fn !== "function") continue;
          const out = await fn(req, ctx);
          if (out) return out;
        }
      }

      const p = path === "/" ? "/index.html" : path;
      if (files[p]) return new Response(files[p], { headers: { ...cors(origin), "Content-Type": types[extname(p)] || "application/octet-stream" } });
      return toJson({ error: "Not Found" }, 404);
    },
  };

  // Enable TLS unless explicitly disabled (sometimes done behind TLS-terminating proxies).
  if (!disableSsl) {
    const missing = ["cert.pem", "key.pem"].filter((name) =>
      !existsSync(join(app.path, certsDir, name))
    );
    if (missing.length) {
      console.warn(
        `[warning] Missing TLS file${missing.length > 1 ? "s" : ""} in ${certsDir}/: ${missing.join(", ")}`
      );
    }

    server.tls = {
      cert: Bun.file(join(app.path, certsDir, "cert.pem")),
      key: Bun.file(join(app.path, certsDir, "key.pem")),
    };
  }

  return server;
}

export default createServer;

if (import.meta.main) {
  const server = createServer();
  if (configPath) console.log(`using config: ${configPath}`);
  console.log(`server starting on ${disableSsl ? "http" : "https"}://localhost:${server.port}...`);
  Bun.serve(server);
}
