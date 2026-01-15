import { S3Client } from "bun";

const dbPath = "db.json";
const db = await Bun.file(dbPath).json().catch(() => ({}));
const s3 = new S3Client({
  accessKeyId: Bun.env.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: Bun.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  bucket: Bun.env.CLOUDFLARE_BUCKET_NAME,
  endpoint: Bun.env.CLOUDFLARE_PUBLIC_URL
});
const json = (data, status = 200, extraHeaders = {}) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PURGE, PROPFIND, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie, X-HTTP-Method-Override",
    "Access-Control-Allow-Credentials": "true",
    "Content-Type": "application/json",
    ...extraHeaders
  }
});
const keys = Object.keys(db);

export default {
  async fetch(req) {
    const url = new URL(req.url);
    const key = url.pathname.slice(1);
    const redirect_uri = `${url.origin}/callback`; // Must match Auth0 settings exactly

    // --- PREFLIGHT ---
    if (req.method === "OPTIONS") return json(null, 204);

    // --- LOGIN ---
    if (url.pathname === '/login') {
      const params = new URLSearchParams({
        response_type: "code",
        client_id: Bun.env.AUTH0_CLIENT_ID,
        redirect_uri, // Fixed: must be the callback URL
        scope: "openid email"
      });
      return Response.redirect(`https://${Bun.env.AUTH0_DOMAIN}/authorize?${params}`);
    }

    // --- CALLBACK ---
    if (url.pathname === '/callback') {
      const code = url.searchParams.get("code");
      if (!code) return json({ error: 'No code' }, 400);

      const tRes = await fetch(`https://${Bun.env.AUTH0_DOMAIN}/oauth/token`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          grant_type: "authorization_code",
          client_id: Bun.env.AUTH0_CLIENT_ID,
          client_secret: Bun.env.AUTH0_CLIENT_SECRET,
          code,
          redirect_uri 
        })
      });

      if (!tRes.ok) return json({ error: 'Auth error' }, 401);
      const tokens = await tRes.json();
      
      const uRes = await fetch(`https://${Bun.env.AUTH0_DOMAIN}/userinfo`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });

      const session = crypto.randomUUID();
      // Update MEMORY and DISK
      db[`session:${session}`] = await uRes.json();
      await Bun.write(dbPath, JSON.stringify(db, null, 2));

      return new Response(null, {
        status: 302,
        headers: {
          Location: url.origin,
          "Set-Cookie": `token=${session}; HttpOnly; Path=/; Secure; SameSite=Lax; Max-Age=86400`
        }
      });
    }

    // --- AUTH CHECK ---
    const token = req.headers.get("Cookie")?.match(/token=([^;]+)/)?.[1];
    const user = token ? db[`session:${token}`] : null;
    if (!token || !user) return json({ error: 'Unauthorized' }, 401);

    // --- LOGOUT ---
    if (url.pathname === '/logout') {
      delete db[`session:${token}`];
      await Bun.write(dbPath, JSON.stringify(db, null, 2));
      return new Response(null, {
        status: 302,
        headers: { Location: url.origin, "Set-Cookie": "token=; Max-Age=0; Path=/" }
      });
    }

    // --- API ---
    switch (req.method) {
      case 'GET':
        if(url.pathname === '/') return new Response(Bun.file("./public/index.html"));
        if(url.pathname === '/client.js') return new Response(Bun.file("./public/client.js"));
        if(url.pathname === '/custom.js') return new Response(Bun.file("./public/custom.js"));
        return json(db[key]);

      case 'POST':
        db[key] = await req.json();
        await Bun.write(dbPath, JSON.stringify(db, null, 2));
        return json(db[key]);

      case 'DELETE':
        delete db[key];
        await Bun.write(dbPath, JSON.stringify(db, null, 2)); // Fix: write to dbPath
        return json({ status: "Deleted" });

      case 'PUT':
        await s3.write(`${user.sub}/${key}`, req.body); // Fix: Bun uses .write()
        return json({ status: "Saved to R2" });

      case 'PURGE':
        await s3.delete(`${user.sub}/${key}`);
        return json({ status: "Deleted from R2" });

      case 'PROPFIND':  
        const list = await s3.list({ prefix: `${user.sub}/` });
        const ret = list.contents.map(item => ({name: item.key.split('/').pop(), lastModified: item.lastModified, size: item.size}));
        return json(ret);

      default:
        return json({ error: 'Method not allowed' }, 405);
    }
  },
  port: 3000,
  tls: {
    cert: Bun.file("cert.pem"),
    key: Bun.file("key.pem"),
  },
};