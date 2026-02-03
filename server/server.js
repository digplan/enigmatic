import { join } from "path";
import { routes as storageRoutes } from "./plugin/storage.js";
import { routes as oauthRoutes, getTokenAndUser as getOauthUser } from "./plugin/oauth.js";
import { routes as bearerRoutes, getTokenAndUser as getBearerUser } from "./plugin/auth-bearer.js";
import { routes as s3Routes } from "./plugin/s3.js";
import { routes as llmRoutes } from "./plugin/llmchat.js";
const dir = import.meta.dir;
const certsDir = join(dir, "certs");
const publicDir = join(dir, "..", "client", "public");

function makeJson(origin) {
  return (d, s = 200, h = {}, o = null) =>
    new Response(JSON.stringify(d), {
      status: s,
      headers: {
        "Access-Control-Allow-Origin": o ?? origin ?? "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PURGE, PROPFIND, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
        "Access-Control-Allow-Credentials": "true",
        "Content-Type": "application/json",
        ...h,
      },
    });
}

function redir(url, cookie) {
  return new Response(null, { status: 302, headers: { Location: url, ...(cookie && { "Set-Cookie": cookie }) } });
}

/** Plugins expose route tables; first matching handler wins. See server/plugin/README.md */
const routeTable = [llmRoutes, bearerRoutes, oauthRoutes, storageRoutes, s3Routes]
  .flatMap((r) => Object.entries(r || {}));

const matchesRoute = (p, m, routePath, methods) => (routePath === "*" || routePath === p) && methods[m] != null;

export default {
  async fetch(req) {
    const url = new URL(req.url), path = url.pathname, method = req.method, origin = req.headers.get("Origin") || url.origin;
    const bearer = getBearerUser(req);
    const oauth = getOauthUser(req);
    const token = bearer.token || oauth.token;
    const user = bearer.user || oauth.user;
    const json = makeJson(origin);
    const ctx = { req, url, method, path, key: path.slice(1), origin, user, token, json: (d, s, h, o) => json(d, s, h, o), redir };
    console.log("%s %s %s", new Date().toISOString(), method, path);

    // CORS preflight
    if (method === "OPTIONS") return json(null, 204, {}, origin);

    // Static file serving
    if (req.method === "GET") {
      const p = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
      if (p === "index.html" || /\.[a-z0-9]+$/i.test(p)) {
        const f = Bun.file(join(publicDir, p));
        if (await f.exists()) return new Response(f);
      }
    }

    // Route matching
    for (const [routePath, methods] of routeTable) {
      if (!matchesRoute(path, method, routePath, methods)) continue;
      const handler = methods[method];
      if (typeof handler !== "function") continue;
      const res = await handler(req, ctx);
      if (res) return res;
    }

    // Not found
    return json({ error: "Not found" }, 404, {}, origin);
  },
  port: 3000,
  tls: {
    cert: Bun.file(join(certsDir, "cert.pem")),
    key: Bun.file(join(certsDir, "key.pem")),
  },
};
