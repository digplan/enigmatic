const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PURGE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie, X-HTTP-Method-Override",
  "Access-Control-Allow-Credentials": "true"
}

export default {
  async fetch(req, env) {
    try {
      const url = new URL(req.url), path = url.pathname, key = path.slice(1);
      const cb = `https://${url.host}/callback`, logout_url = `https://${url.host}`;
      const token = req.headers.get("Cookie")?.match(/token=([^;]+)/)?.[1];

      if (req.method === "OPTIONS") {
        return new Response(null, { 
          status: 204,
          headers: cors 
        });
      }

      // Handle logout
      if (path === "/logout") {
        if (token) await env.KV.delete(`session:${token}`);
        return new Response(null, { status: 302, headers: { 
          ...cors,
          Location: `https://${env.AUTH0_DOMAIN}/v2/logout?client_id=${env.AUTH0_CLIENT_ID}&returnTo=${logout_url}`,
          "Set-Cookie": "token=; Max-Age=0; Path=/; Secure; SameSite=None"
        }});
      }

      // Handle login
      if (path === "/login") {
        try {
          const lu = `https://${env.AUTH0_DOMAIN}/authorize?response_type=code&client_id=${env.AUTH0_CLIENT_ID}&redirect_uri=${encodeURIComponent(cb)}&scope=openid email`;
          console.log(lu);
          return Response.redirect(lu);
        } catch (e) {
          return new Response(`Error at line 34: ${e.message}`, { status: 500, headers: cors });
        }
      }

      if (path === "/callback") {
        try {
          console.log('callback', url.searchParams);
          const code = url.searchParams.get("code");
          if (!code) return new Response("No code", { status: 400, headers: cors });

          const tRes = await fetch(`https://${env.AUTH0_DOMAIN}/oauth/token`, {
            method: "POST", headers: { "content-type": "application/json" },
            body: JSON.stringify({ grant_type: "authorization_code", client_id: env.AUTH0_CLIENT_ID, client_secret: env.AUTH0_CLIENT_SECRET, code, redirect_uri: cb })
          });
          const tData = await tRes.json();
          if (!tRes.ok) return new Response("Auth Error", { status: 401, headers: cors });

          const uRes = await fetch(`https://${env.AUTH0_DOMAIN}/userinfo`, { headers: { Authorization: `Bearer ${tData.access_token}` }});
          const sess = crypto.randomUUID();
          await env.KV.put(`session:${sess}`, JSON.stringify(await uRes.json()), { expirationTtl: 86400 });

          return new Response(null, { status: 302, headers: { 
            ...cors,
            Location: "https://localhost:3000", 
            "Set-Cookie": `token=${sess}; HttpOnly; Path=/; Secure; SameSite=None; Max-Age=86400` 
          }});
        } catch (e) {
          return new Response(`Error at line 43: ${e.message}`, { status: 500, headers: cors });
        }
      }

      // AUTH CHECK
      if (!token || !(await env.KV.get(`session:${token}`))) return new Response("Unauthorized", { status: 401, headers: cors });

      if (!key) return new Response(null, { status: 302, headers: { ...cors, Location: "https://localhost:3000" } });
        
      // API OPERATIONS (Added cors to all responses)
      try {
        const method = req.headers.get("X-HTTP-Method-Override") || req.method;
        switch (method) {
          case "GET": return new Response(await env.KV.get(key) || "Not found", { headers: cors });
          case "DELETE": await env.KV.delete(key); return new Response("Deleted KV", { headers: cors });
          case "POST":
            await env.KV.put(key, await req.text()); 
            return new Response("Saved KV", { headers: cors });
          case "PUT": 
            await env.MY_R2.put(key, req.body); 
            return new Response("Saved R2", { headers: cors });
          case "PURGE":
            await env.MY_R2.delete(key); 
            return new Response("Deleted R2", { headers: cors });
          default: return new Response("Method not allowed", { status: 405, headers: cors });
        }
      } catch (e) {
        return new Response(`Error at line 73: ${e.message}`, { status: 500, headers: cors });
      }
    } catch (e) {
      return new Response(`Error: ${e.message}`, { status: 500, headers: cors });
    }
  }
};