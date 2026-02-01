import { S3Client } from "bun";
import { join } from "path";
import { appendFile, mkdir, readFile } from "fs/promises";

const dir = import.meta.dir;
const certsDir = join(dir, "certs");
const publicDir = join(dir, "..", "client", "public");
const kvDir = join(dir, "kv");
const sessions = new Map();
const userKv = {};
let site_origin = "";

const kvPath = (sub) => join(kvDir, `${String(sub).replace(/[^a-zA-Z0-9_-]/g, "_")}.jsonl`);
const json = (d, s = 200, h = {}, origin = null) => new Response(JSON.stringify(d), { status: s, headers: { "Access-Control-Allow-Origin": origin || "*", "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PURGE, PROPFIND, PATCH, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie", "Access-Control-Allow-Credentials": "true", "Content-Type": "application/json", ...h } });
const redir = (url, cookie) => new Response(null, { status: 302, headers: { Location: url, ...(cookie && { "Set-Cookie": cookie }) } });

async function getUserMap(sub) {
  if (userKv[sub]) return userKv[sub];
  const m = new Map();
  try {
    let buf = await readFile(kvPath(sub), "utf8");
    if (buf.charCodeAt(0) === 0xfeff) buf = buf.slice(1);
    const lines = buf.trim().split("\n").filter(Boolean);
    for (const line of lines) {
      try {
        const row = JSON.parse(line);
        if (Array.isArray(row) && row.length >= 2) {
          m.set(row[0], row[1]);
        } else if (row?.action === "update" && row.key !== undefined) {
          m.set(row.key, row.value);
        } else if (row?.action === "delete" && row.key !== undefined) {
          m.delete(row.key);
        }
      } catch (_) { /* skip malformed line */ }
    }
  } catch (_) { /* file missing or unreadable */ }
  userKv[sub] = m;
  return m;
}

async function appendKvLog(sub, action, key, value) {
  await mkdir(kvDir, { recursive: true });
  const ts = new Date().toISOString();
  const row = action === "update" ? { action, key, value, timestamp: ts } : { action, key, timestamp: ts };
  await appendFile(kvPath(sub), JSON.stringify(row) + "\n");
}

async function saveUserKv(sub, action, key, value) {
  await appendKvLog(sub, action, key, value);
}

const s3 = new S3Client({
  accessKeyId: Bun.env.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: Bun.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  bucket: Bun.env.CLOUDFLARE_BUCKET_NAME,
  endpoint: Bun.env.CLOUDFLARE_PUBLIC_URL
});

export default {
  async fetch(req) {
    const url = new URL(req.url), key = url.pathname.slice(1), cb = `${url.origin}/callback`;
    const origin = req.headers.get("Origin") || url.origin;
    console.log("%s %s", req.method, url.pathname);
    const token = req.headers.get("Cookie")?.match(/token=([^;]+)/)?.[1];
    const user = (Bun.env.TEST_MODE === "1" && token === Bun.env.TEST_SESSION_ID) ? { sub: "test-user" } : (token ? sessions.get(token) : null);

    if (req.method === "OPTIONS") return json(null, 204, {}, origin);

    // LLM proxy (no auth required)
    if (url.pathname === "/llm/chat" && req.method === "POST") {
      console.log("[llm] %s %s from %s", req.method, url.pathname, origin || req.headers.get("Origin") || "-");
      try {
        const body = await req.json();
        const fixedModel = Bun.env.USE_LLM_MODEL;
        const model = fixedModel || body?.model || "(none)";
        const msgCount = Array.isArray(body?.messages) ? body.messages.length : 0;
        console.log("[llm] body: model=%s messages=%d", model, msgCount);
        const headers = { "Authorization": `${Bun.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" };
        console.log("[llm] headers: %s", JSON.stringify(headers));
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers, body: JSON.stringify(body) });
        const out = await response.json();
        console.log("[llm] OpenRouter status=%d", response.status);
        console.log("[llm] response: %s", JSON.stringify(out));
        return json(out, response.status, {}, origin);
      } catch (e) {
        console.error("[llm] error:", e.message);
        return json({ error: "LLM request failed", details: e.message }, 500, {}, origin);
      }
    }

    if (req.method === "GET") {
      const p = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
      if (p === "index.html" || /\.[a-z0-9]+$/i.test(p)) {
        const f = Bun.file(join(publicDir, p));
        if (await f.exists()) return new Response(f);
      }
    }

    if (url.pathname === "/login") {
      site_origin = req.headers.get("referer");
      return Response.redirect(`https://${Bun.env.AUTH0_DOMAIN}/authorize?${new URLSearchParams({ response_type: "code", client_id: Bun.env.AUTH0_CLIENT_ID, redirect_uri: cb, scope: "openid email profile" })}`);
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) return json({ error: "No code" }, 400, {}, origin);
      const tRes = await fetch(`https://${Bun.env.AUTH0_DOMAIN}/oauth/token`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ grant_type: "authorization_code", client_id: Bun.env.AUTH0_CLIENT_ID, client_secret: Bun.env.AUTH0_CLIENT_SECRET, code, redirect_uri: cb }) });
      if (!tRes.ok) return json({ error: "Auth error" }, 401, {}, origin);
      const tokens = await tRes.json();
      const userInfo = await (await fetch(`https://${Bun.env.AUTH0_DOMAIN}/userinfo`, { headers: { Authorization: `Bearer ${tokens.access_token}` } })).json();
      const sid = crypto.randomUUID();
      sessions.set(sid, { ...userInfo, login_time: new Date().toISOString(), access_token_expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null });
      return redir(site_origin || url.origin, `token=${sid}; HttpOnly; Path=/; Secure; SameSite=None; Max-Age=86400`);
    }

    if (url.pathname === "/me") return user ? json(user, 200, {}, origin) : json({ error: "Unauthorized" }, 401, {}, origin);
    if (!token || !user) return json({ error: "Unauthorized" }, 401, {}, origin);
    if (url.pathname === "/logout") { sessions.delete(token); return redir(url.origin, "token=; Max-Age=0; Path=/; Secure; SameSite=None"); }

    const m = await getUserMap(user.sub);
    switch (req.method) {
      case "GET": return json(m.get(key) ?? null, 200, {}, origin);
      case "POST":
        const val = await req.text();
        const v = (() => { try { return JSON.parse(val); } catch { return val; } })();
        m.set(key, v);
        await saveUserKv(user.sub, "update", key, v);
        return json({ key, value: v }, 200, {}, origin);
      case "DELETE": m.delete(key); await saveUserKv(user.sub, "delete", key); return json({ status: "Deleted" }, 200, {}, origin);
      case "PUT": await s3.write(`${user.sub}/${key}`, req.body); return json({ status: "Saved to R2" }, 200, {}, origin);
      case "PURGE": await s3.delete(`${user.sub}/${key}`); return json({ status: "Deleted from R2" }, 200, {}, origin);
      case "PROPFIND":
        const list = await s3.list({ prefix: `${user.sub}/` });
        const items = Array.isArray(list) ? list : (list?.contents || []);
        return json(items.map((i) => ({ name: i.key?.split("/").pop() || i.name || i.Key, lastModified: i.lastModified || i.LastModified, size: i.size || i.Size || 0 })), 200, {}, origin);
      case "PATCH":
        try {
          if (!(await s3.exists(`${user.sub}/${key}`))) {
            const headers = { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true" };
            return new Response(JSON.stringify({ error: "File not found" }), { status: 404, headers: { ...headers, "Content-Type": "application/json" } });
          }
          const f = await s3.file(`${user.sub}/${key}`);
          if (f) {
            const headers = { ...f.headers, "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true" };
            return new Response(f.stream(), { headers });
          }
          const headers = { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true" };
          return new Response(JSON.stringify({ error: "File not found" }), { status: 404, headers: { ...headers, "Content-Type": "application/json" } });
        } catch (e) { return json({ error: "File not found", details: e.message }, 404, {}, origin); }
      default: return json({ error: "Method not allowed" }, 405, {}, origin);
    }
  },
  port: 3000,
  tls: { cert: Bun.file(join(certsDir, "cert.pem")), key: Bun.file(join(certsDir, "key.pem")) }
};
