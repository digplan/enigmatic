const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PURGE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Cookie",
  "Access-Control-Allow-Credentials": "true"
}

function addCors(res) {
  const headers = new Headers(res.headers)
  Object.entries(corsHeaders).forEach(([k, v]) => headers.set(k, v))
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers })
}

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders })
    }

    const url = new URL(req.url), path = url.pathname, key = path.slice(1);
    const cb = `https://${url.host}/callback`;
    const token = req.headers.get("Cookie")?.match(/token=([^;]+)/)?.[1];
    
    // 1. LOGOUT (First to fix "zombie session" lockouts)
    if (path === "/logout") {
      if (token) await env.MY_KV.delete(`session:${token}`);
      const headers = { 
        ...corsHeaders,
        Location: `https://${env.AUTH0_DOMAIN}/v2/logout?client_id=${env.AUTH0_CLIENT_ID}&returnTo=${url.origin}`,
        "Set-Cookie": "token=; Max-Age=0; Path=/; Secure; SameSite=Lax"
      }
      return new Response(null, { status: 302, headers });
    }

    // PUBLIC: Login & Callback
    if (path === "/login") {
      const lu = `https://${env.AUTH0_DOMAIN}/authorize?response_type=code&client_id=${env.AUTH0_CLIENT_ID}&redirect_uri=${encodeURIComponent(cb)}&scope=openid email`;
      console.log(lu);
      return addCors(Response.redirect(lu));
    }

    if (path === "/callback") {
      console.log('callback', url.searchParams);
      const code = url.searchParams.get("code");
      if (!code) return addCors(new Response("No code", { status: 400 }));

      const tRes = await fetch(`https://${env.AUTH0_DOMAIN}/oauth/token`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ grant_type: "authorization_code", client_id: env.AUTH0_CLIENT_ID, client_secret: env.AUTH0_CLIENT_SECRET, code, redirect_uri: cb })
      });
      const tData = await tRes.json();
      if (!tRes.ok) return addCors(new Response("Auth Error", { status: 401 }));

      const uRes = await fetch(`https://${env.AUTH0_DOMAIN}/userinfo`, { headers: { Authorization: `Bearer ${tData.access_token}` }});
      const sess = crypto.randomUUID();
      await env.MY_KV.put(`session:${sess}`, JSON.stringify(await uRes.json()), { expirationTtl: 86400 });

      const headers = {
        ...corsHeaders,
        Location: "/",
        "Set-Cookie": `token=${sess}; HttpOnly; Path=/; Secure; SameSite=Lax; Max-Age=86400`
      }
      return new Response(null, { status: 302, headers });
    }

    // AUTH CHECK
    if (!token || !(await env.MY_KV.get(`session:${token}`))) return addCors(new Response("Unauthorized", { status: 401 }));

    if (!key) return addCors(new Response("Welcome"));
    switch (req.method) {
      case "GET": return addCors(new Response(await env.MY_KV.get(key) || "Not found"));
      case "DELETE": await env.MY_KV.delete(key); return addCors(new Response("Deleted KV"));
      case "POST": await env.MY_KV.put(key, await req.text()); return addCors(new Response("Saved KV"));
      case "PUT": await env.MY_R2.put(key, req.body); return addCors(new Response("Saved R2"));
      case "PURGE": await env.MY_R2.delete(key); return addCors(new Response("Deleted R2"));
      default: return addCors(new Response("Method not allowed", { status: 405 }));
    }
  }
};