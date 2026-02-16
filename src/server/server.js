import { extname, join } from "node:path";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import config from "#app/config.json";

// Plugins
const app = { 
  path: import.meta.path.split("/src")[0], 
  routes: { always: [] },
  requiredEnvs: [],
  getUserFns: []
};

for (const name of config.use_plugins || []) {
  try {
    const mod = await import(name.startsWith("/") ? name : `#plugins/${name}`);
    if (typeof mod.default === "function") await mod.default(app);
  } catch (e) {
    console.error(`Failed to load plugin ${name}: ${e.message}`);
  }
}

// Check env
const required = [
  ...(Array.isArray(app.requiredEnvs) ? app.requiredEnvs : []),
  ...(Array.isArray(app.requiredEnv) ? app.requiredEnv : []),
];
const missing = [...new Set(required)].filter((k) => !Bun.env[k]);
if (missing.length) throw new Error(`Missing env: ${missing.join(", ")}`);

// Static files
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

const redir = (url, cookie) =>
  new Response(null, {
    status: 302,
    headers: {
      Location: url,
      ...(cookie ? { "Set-Cookie": cookie } : {}),
    },
  });

export function warnMissingTlsFiles() {
  const certPath = join(app.path, "certs", "cert.pem");
  const keyPath = join(app.path, "certs", "key.pem");
  const missing = [
    !existsSync(certPath) ? "cert.pem" : null,
    !existsSync(keyPath) ? "key.pem" : null,
  ].filter(Boolean);

  if (missing.length) {
    console.warn(
      `[warning] Missing TLS file${missing.length > 1 ? "s" : ""} in certs/: ${missing.join(", ")}`
    );
  }
}

export function createServer(options = {}) {
  return {
    port: options.port ?? config.port ?? 3000,
    tls: {
      cert: Bun.file(join(app.path, "certs", "cert.pem")),
      key: Bun.file(join(app.path, "certs", "key.pem")),
    },
    async fetch(req) {
      const url = new URL(req.url), path = url.pathname, key = path.slice(1), origin = req.headers.get("Origin") || url.origin;
      if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
      for (const fn of app.routes.always || []) fn(req, null, null);

      let auth = { token: null, user: null };
      for (const getUser of app.getUserFns || []) {
        const out = getUser(req);
        if (out?.token || out?.user) {
          auth = out;
          break;
        }
      }

      const json = (d, s = 200, h = {}) =>
        new Response(JSON.stringify(d), { status: s, headers: { ...cors(origin), "Content-Type": "application/json", ...h } });
      const ctx = { req, method: req.method, path, key, url, origin, token: auth.token, user: auth.user, json, redir };

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
      return json({ error: "Not Found" }, 404);
    },
  };
}

export default createServer;

if (import.meta.main) {
  const server = createServer();
  console.log(`vanilla-light server starting on port ${server.port}...`);
  warnMissingTlsFiles();
  Bun.serve(server);
}
