import { Database } from "bun:sqlite";
import { S3Client } from "bun";
import { existsSync } from "fs";
import { join } from "path";
import crypto from "crypto";

// Database
const db = new Database("data.db");
db.run("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT, pass TEXT, token TEXT, picture TEXT, name TEXT, email TEXT)");
db.run("CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT)");

// Auth0
const [AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET] = [process.env.AUTH0_DOMAIN, process.env.AUTH0_CLIENT_ID, process.env.AUTH0_CLIENT_SECRET];
const AUTH0_CALLBACK_URL = process.env.AUTH0_CALLBACK_URL || "https://localhost:3001/callback";
const BASE_URL = process.env.BASE_URL || "https://localhost:3001";

// Utility functions
const genToken = () => crypto.randomBytes(32).toString("hex");
const getUser = (t) => t ? db.prepare("SELECT * FROM users WHERE token = ?").get(t) : null;
const getToken = (r) => {
  const c = r.headers.get("cookie")?.split(";").reduce((a, x) => {
    const [k, v] = x.trim().split("=");
    return { ...a, [k]: v };
  }, {});
  return c?.token || null;
};

// R2 client
const r2 = new S3Client({
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID ?? (() => { throw new Error("CLOUDFLARE_ACCESS_KEY_ID is not set"); })(),
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY ?? (() => { throw new Error("CLOUDFLARE_SECRET_ACCESS_KEY is not set"); })(),
  bucket: process.env.CLOUDFLARE_BUCKET_NAME ?? (() => { throw new Error("CLOUDFLARE_BUCKET_NAME is not set"); })(),
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com` ?? (() => { throw new Error("CLOUDFLARE_ACCOUNT_ID is not set"); })(),
});

console.log("✓ R2 client initialized");

// SSE clients
global.sseClients = [];
global.broadcast = (d) => global.sseClients.forEach(c => c.write(`data: ${JSON.stringify(d)}\n\n`));

// Server
Bun.serve({
  development: true,
  port: 3001,
  tls: {
    cert: await Bun.file("cert.pem").text(),
    key: await Bun.file("key.pem").text(),
  },
  async fetch(req) {
    const { pathname } = new URL(req.url);
    const m = req.method;

    if (pathname === "/login" && m === "GET") {
      return Response.redirect(`https://${AUTH0_DOMAIN}/authorize?response_type=code&client_id=${AUTH0_CLIENT_ID}&redirect_uri=${encodeURIComponent(AUTH0_CALLBACK_URL)}&scope=openid profile email&state=${genToken()}`);
    }

    if (pathname === "/callback" && m === "GET") {
      const code = new URL(req.url).searchParams.get("code");
      const err = new URL(req.url).searchParams.get("error");
      if (err) return new Response(`Auth error: ${err}`, { status: 400 });
      if (!code) return new Response("Missing authorization code", { status: 400 });

      try {
        const tr = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grant_type: "authorization_code", client_id: AUTH0_CLIENT_ID, client_secret: AUTH0_CLIENT_SECRET, code, redirect_uri: AUTH0_CALLBACK_URL }),
        });
        if (!tr.ok) return new Response(`Token exchange failed: ${await tr.text()}`, { status: 400 });

        const { access_token } = await tr.json();
        const ui = await (await fetch(`https://${AUTH0_DOMAIN}/userinfo`, { headers: { Authorization: `Bearer ${access_token}` } })).json();
        const st = genToken();

        db.prepare("INSERT OR REPLACE INTO users (id, username, token, picture, name, email) VALUES (?, ?, ?, ?, ?, ?)").run(
          ui.sub, ui.nickname || ui.name || ui.email, st, ui.picture || "", ui.name || "", ui.email || ""
        );

        return new Response(null, {
          status: 302,
          headers: { Location: "/", "Set-Cookie": `token=${st}; Path=/; HttpOnly; SameSite=Lax` },
        });
      } catch (e) {
        return new Response(`Callback error: ${e.message}`, { status: 500 });
      }
    }

    if (pathname === "/logout" && m === "GET") {
      const t = getToken(req);
      if (t) db.prepare("UPDATE users SET token = NULL WHERE token = ?").run(t);
      return new Response(null, {
        status: 302,
        headers: {
          Location: `https://${AUTH0_DOMAIN}/v2/logout?client_id=${AUTH0_CLIENT_ID}&returnTo=${encodeURIComponent(BASE_URL)}`,
          "Set-Cookie": "token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
        },
      });
    }

    if (pathname === "/sse" && m === "GET") {
      const enc = new TextEncoder();
      return new Response(new ReadableStream({
        start(ctrl) {
          const cli = { write: (d) => ctrl.enqueue(enc.encode(d)) };
          global.sseClients.push(cli);
          ctrl.enqueue(enc.encode("data: { \"status\": \"connected\" }\n\n"));
          req.signal.addEventListener("abort", () => global.sseClients = global.sseClients.filter(c => c !== cli));
        },
      }), {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
      });
    }

    const auth = (fn) => {
      const t = getToken(req);
      const u = getUser(t);
      return u ? fn(u) : Response.json({ error: "Unauthorized" }, { status: 401 });
    };

    if (pathname === "/api" && m === "POST") {
      return auth(async (u) => {
        const { key, value } = await req.json();
        const kk = `${u.username}:${key}`;
        db.prepare("INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)").run(kk, value);
        global.broadcast({ type: "update", user: u.username, key, value });
        return Response.json(db.prepare("SELECT substr(key, instr(key, ':') + 1) AS key, value FROM kv WHERE key = ?").get(kk));
      });
    }

    if (pathname === "/api" && m === "GET") {
      return auth((u) => {
        const key = new URL(req.url).searchParams.get("key");
        const res = db.prepare("SELECT substr(key, instr(key, ':') + 1) AS key, value FROM kv WHERE key = ?").get(`${u.username}:${key}`) || {};
        global.broadcast({ type: "update", ...res });
        return Response.json(res);
      });
    }

    if (pathname === "/all" && m === "GET") {
      return auth((u) => {
        global.broadcast({ type: "all", user: u.username });
        return Response.json(db.prepare("SELECT substr(key, instr(key, ':') + 1) AS key, value FROM kv WHERE key LIKE ?").all(`${u.username}:%`) || []);
      });
    }

    if (pathname === "/api" && m === "DELETE") {
      return auth((u) => {
        const key = new URL(req.url).searchParams.get("key");
        global.broadcast({ type: "delete", user: u.username, key });
        db.prepare("DELETE FROM kv WHERE key = ?").run(`${u.username}:${key}`);
        return Response.json({ deleted: true, key });
      });
    }

    if (pathname === "/files" && m === "POST") {
      try {
        const { contents = [] } = await r2.list();
        return Response.json(contents.map(({ key, size, lastModified }) => ({ key, size, lastModified })));
      } catch (e) {
        return Response.json({ error: "R2 operation failed", message: e.message }, { status: 503 });
      }
    }

    const apiPaths = ["/api", "/sse", "/login", "/callback", "/logout", "/all", "/files"];
    if (pathname.startsWith("/") && !apiPaths.some(p => pathname.startsWith(p))) {
      const pub = join(process.cwd(), "public");
      if (existsSync(pub)) {
        const fp = join(pub, pathname === "/" ? "index.html" : pathname.slice(1));
        if (fp.startsWith(pub) && existsSync(fp)) {
          const ext = fp.split(".").pop()?.toLowerCase();
          const ct = { html: "text/html", css: "text/css", js: "application/javascript", json: "application/json", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", svg: "image/svg+xml", ico: "image/x-icon" }[ext] || "application/octet-stream";
          return new Response(Bun.file(fp), { headers: { "Content-Type": ct } });
        }
      }
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Server running on ${tls ? "https" : "http"}://localhost:3001`);
