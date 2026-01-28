import { S3Client } from "bun";
import { BeeMap } from "./beemap.js";

const sessions = new BeeMap("sessions.jsonl", 20000), beeMaps = {};
const s3 = new S3Client({
  accessKeyId: Bun.env.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: Bun.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  bucket: Bun.env.CLOUDFLARE_BUCKET_NAME,
  endpoint: Bun.env.CLOUDFLARE_PUBLIC_URL
});

const json = (data, status = 200, extraHeaders = {}) => new Response(JSON.stringify(data), {
  status, headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PURGE, PROPFIND, DOWNLOAD, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie, X-HTTP-Method-Override",
    "Access-Control-Allow-Credentials": "true",
    "Content-Type": "application/json",
    ...extraHeaders
  }
});

const redirect = (url, cookie = null) => new Response(null, {
  status: 302,
  headers: { Location: url, ...(cookie && { "Set-Cookie": cookie }) }
});

export default {
  async fetch(req) {
    const url = new URL(req.url), key = url.pathname.slice(1);
    const token = req.headers.get("Cookie")?.match(/token=([^;]+)/)?.[1];
    const user = token ? sessions.get(token) : null;

    if (req.method === "OPTIONS") return json(null, 204);

    // Serve static files from public folder
    if (req.method === 'GET') {
      const file = Bun.file(`./public${url.pathname === '/' ? '/index.html' : url.pathname}`);
      if (await file.exists()) return new Response(file);
    }

    if (url.pathname === '/login') {
      return Response.redirect(`https://${Bun.env.AUTH0_DOMAIN}/authorize?${new URLSearchParams({
        response_type: "code", client_id: Bun.env.AUTH0_CLIENT_ID, redirect_uri: cb, scope: "openid email profile"
      })}`);
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get("code");
      if (!code) return json({ error: 'No code' }, 400);
      const tRes = await fetch(`https://${Bun.env.AUTH0_DOMAIN}/oauth/token`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          grant_type: "authorization_code", client_id: Bun.env.AUTH0_CLIENT_ID,
          client_secret: Bun.env.AUTH0_CLIENT_SECRET, code, redirect_uri: `${url.origin}/callback`
        })
      });
      if (!tRes.ok) return json({ error: 'Auth error' }, 401);
      const tokens = await tRes.json();
      const userInfo = await (await fetch(`https://${Bun.env.AUTH0_DOMAIN}/userinfo`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      })).json();
      const session = crypto.randomUUID();
      sessions.set(session, {
        ...userInfo,
        login_time: new Date().toISOString(),
        access_token_expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null
      });
      return redirect(url.origin, `token=${session}; HttpOnly; Path=/; Secure; SameSite=Lax; Max-Age=86400`);
    }

    if (!token || !user) return json({ error: 'Unauthorized' }, 401);

    if (url.pathname === '/logout') {
      sessions.delete(token);
      return redirect(url.origin, "token=; Max-Age=0; Path=/");
    }

    // Initialize user's beeMap if needed
    if (!beeMaps[user.sub]) beeMaps[user.sub] = new BeeMap(`kv_${user.sub}.jsonl`, 20000);

    switch (req.method) {
      case 'GET': return json(beeMaps[user.sub].get(key) || null);
      case 'POST':
        const value = await req.text();
        beeMaps[user.sub].set(key, (() => { try { return JSON.parse(value); } catch { return value; } })());
        return json({ key, value });
      case 'DELETE':
        beeMaps[user.sub].delete(key);
        return json({ status: "Deleted" });
      case 'PUT':
        await s3.write(`${user.sub}/${key}`, req.body);
        return json({ status: "Saved to R2" });
      case 'PURGE':
        await s3.delete(`${user.sub}/${key}`);
        return json({ status: "Deleted from R2" });
      case 'PROPFIND':
        const list = await s3.list({ prefix: `${user.sub}/` });
        const items = Array.isArray(list) ? list : (list?.contents || []);
        return json(items.map(item => ({
          name: item.key?.split('/').pop() || item.name || item.Key,
          lastModified: item.lastModified || item.LastModified,
          size: item.size || item.Size || 0
        })));
      case 'PATCH':
        try {
          const exists = await s3.exists(`${user.sub}/${key}`);
          if (!exists) return json({ error: 'File not found' }, 404);
          const file = await s3.file(`${user.sub}/${key}`);
          if (!file) return json({ error: 'File not found' }, 404);
          return new Response(file.stream(), { headers: file.headers });
        } catch (err) {
          console.error('Download error:', err);
          return json({ error: 'File not found', details: err.message }, 404);
        }
      default: return json({ error: 'Method not allowed' }, 405);
    }
  },
  
  port: 3000,
  tls: { cert: Bun.file("cert.pem"), key: Bun.file("key.pem") }
};
