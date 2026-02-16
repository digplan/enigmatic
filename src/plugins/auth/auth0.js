function cookieToken(req) {
  const token = (req.headers.get("Cookie") || "").match(/token=([^;]+)/)?.[1] || null;
  return { token };
}

export default function (app) {
  const env = Bun.env;
  const need = ["AUTH0_DOMAIN", "AUTH0_CLIENT_ID", "AUTH0_CLIENT_SECRET"];
  app.requiredEnvs = [...(app.requiredEnvs || []), ...need];
  if (need.some((k) => !env[k])) return;

  const sessions = (app.oauthSessions ||= new Map());
  app.getUserFns.push((req) => {
    const { token } = cookieToken(req);
    return { token, user: token ? sessions.get(token) || null : null };
  });

  let k = "GET /login";
  let fn = async (req, ctx) => {
    const cb = `${ctx.url.origin}/callback`;
    const params = new URLSearchParams({
      response_type: "code",
      client_id: env.AUTH0_CLIENT_ID,
      redirect_uri: cb,
      scope: "openid email profile",
    });
    const back = req.headers.get("referer") || ctx.url.origin;
    return Response.redirect(`https://${env.AUTH0_DOMAIN}/authorize?${params}&state=${encodeURIComponent(back)}`);
  };
  app.routes[k] = app.routes[k] ? (Array.isArray(app.routes[k]) ? [...app.routes[k], fn] : [app.routes[k], fn]) : fn;

  k = "GET /callback";
  fn = async (_req, ctx) => {
    const code = ctx.url.searchParams.get("code");
    if (!code) return ctx.json({ error: "No code" }, 400);

    const cb = `${ctx.url.origin}/callback`;
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
    if (!tRes.ok) return ctx.json({ error: "Auth error" }, 401);

    const tokens = await tRes.json();
    const uRes = await fetch(`https://${env.AUTH0_DOMAIN}/userinfo`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const user = await uRes.json();
    const sid = crypto.randomUUID();
    sessions.set(sid, { ...user, login_time: new Date().toISOString() });

    const back = decodeURIComponent(ctx.url.searchParams.get("state") || ctx.url.origin);
    return ctx.redir(back, `token=${sid}; HttpOnly; Path=/; Secure; SameSite=None; Max-Age=86400`);
  };
  app.routes[k] = app.routes[k] ? (Array.isArray(app.routes[k]) ? [...app.routes[k], fn] : [app.routes[k], fn]) : fn;

  k = "GET /me";
  fn = async (_req, ctx) => {
    if (!ctx.token || !ctx.user) return null;
    return ctx.json(ctx.user);
  };
  app.routes[k] = app.routes[k] ? (Array.isArray(app.routes[k]) ? [...app.routes[k], fn] : [app.routes[k], fn]) : fn;

  k = "GET /logout";
  fn = async (_req, ctx) => {
    if (!ctx.token) return null;
    sessions.delete(ctx.token);
    return ctx.redir(ctx.url.origin, "token=; Max-Age=0; Path=/; Secure; SameSite=None");
  };
  app.routes[k] = app.routes[k] ? (Array.isArray(app.routes[k]) ? [...app.routes[k], fn] : [app.routes[k], fn]) : fn;
}
