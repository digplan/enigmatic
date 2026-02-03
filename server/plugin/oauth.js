/**
 * OAuth (Auth0) plugin: /login, /callback, /me, /logout.
 * Also exposes getTokenAndUser(req) for the server to build ctx.
 * Convention: routes + handle(req, ctx). See plugin/README.md.
 */
export function createOAuth(env) {
  const sessions = new Map();
  const siteOrigin = { current: "" };
  const need = ["AUTH0_DOMAIN", "AUTH0_CLIENT_ID", "AUTH0_CLIENT_SECRET"];
  const missing = need.filter((k) => !env?.[k]);
  if (missing.length) throw new Error(`Missing env: ${missing.join(", ")}`);

  const getTokenAndUser = (req) => {
    const token = (req.headers.get("Cookie") || "").match(/token=([^;]+)/)?.[1] || null;
    return { token, user: token ? sessions.get(token) || null : null };
  };

  const loginRedirect = (cb, referer) => {
    if (referer) siteOrigin.current = referer;
    const params = new URLSearchParams({
      response_type: "code",
      client_id: env.AUTH0_CLIENT_ID,
      redirect_uri: cb,
      scope: "openid email profile",
    });
    return Response.redirect(`https://${env.AUTH0_DOMAIN}/authorize?${params}`);
  };

  const handleCallback = async (url, code, cb) => {
    const tRes = await fetch(`https://${env.AUTH0_DOMAIN}/oauth/token`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: env.AUTH0_CLIENT_ID,
        client_secret: env.AUTH0_CLIENT_SECRET,
        code,
        redirect_uri: cb,
      }),
    });
    if (!tRes.ok) return null;
    const tokens = await tRes.json();
    const userRes = await fetch(`https://${env.AUTH0_DOMAIN}/userinfo`, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
    const userInfo = await userRes.json();
    const sid = crypto.randomUUID();
    sessions.set(sid, {
      ...userInfo,
      login_time: new Date().toISOString(),
      access_token_expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
    });
    const redirectUrl = siteOrigin.current || url.origin;
    const cookie = `token=${sid}; HttpOnly; Path=/; Secure; SameSite=None; Max-Age=86400`;
    return { redirectUrl, cookie };
  };

  const logout = (token) => ({ cookie: "token=; Max-Age=0; Path=/; Secure; SameSite=None" });

  const handle = async (req, ctx) => {
    const cb = `${ctx.url.origin}/callback`;
    if (ctx.path === "/login") return loginRedirect(cb, req.headers.get("referer") ?? undefined);

    if (ctx.path === "/callback") {
      const code = ctx.url.searchParams.get("code");
      if (!code) return ctx.json({ error: "No code" }, 400, {}, ctx.origin);
      const result = await handleCallback(ctx.url, code, cb);
      if (!result) return ctx.json({ error: "Auth error" }, 401, {}, ctx.origin);
      return ctx.redir(result.redirectUrl, result.cookie);
    }

    if (ctx.path === "/me") {
      if (!ctx.token || !ctx.user) return ctx.json({ error: "Not found" }, 404, {}, ctx.origin);
      return ctx.json(ctx.user, 200, {}, ctx.origin);
    }

    if (ctx.path === "/logout") {
      if (!ctx.token) return ctx.redir(ctx.url.origin);
      const { cookie } = logout(ctx.token);
      return ctx.redir(ctx.url.origin, cookie);
    }
    return null;
  };

  return {
    routes: {
      "/login": { GET: handle },
      "/callback": { GET: handle },
      "/me": { GET: handle },
      "/logout": { GET: handle },
    },
    getTokenAndUser,
  };
}

// Default export shape consumed by bun-server (pre-initialized with Bun.env)
export const { routes, getTokenAndUser } = createOAuth(Bun.env);
