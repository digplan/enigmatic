import { randomUUID } from "node:crypto";

export function getBearerUser(req, sessions) {
  const raw = req.headers.get("Authorization") || "";
  const token = /^Bearer\s+(.+)$/i.exec(raw)?.[1] || null;
  return { token, user: token ? sessions.get(token) || null : null };
}

export default function (app) {
  const users = (app.users ||= new Map());
  const sessions = (app.sessions ||= new Map());
  app.getUserFns.push((req) => getBearerUser(req, sessions));

  let k = "POST /register";
  let fn = async (req, ctx) => {
    const body = await req.json().catch(() => ({}));
    const sub = body.sub || randomUUID();
    const user = {
      sub,
      email: body.email || `${sub}@example.com`,
      name: body.name || body.email || sub,
      login_time: new Date().toISOString(),
    };
    users.set(sub, user);
    const token = randomUUID();
    sessions.set(token, user);
    return ctx.json({ token, user });
  };
  app.routes[k] = app.routes[k] ? (Array.isArray(app.routes[k]) ? [...app.routes[k], fn] : [app.routes[k], fn]) : fn;

  k = "POST /login";
  fn = async (req, ctx) => {
    const body = await req.json().catch(() => ({}));
    const user = users.get(body.sub);
    if (!user) return ctx.json({ error: "User not found" }, 404);
    const token = randomUUID();
    sessions.set(token, user);
    return ctx.json({ token, user });
  };
  app.routes[k] = app.routes[k] ? (Array.isArray(app.routes[k]) ? [...app.routes[k], fn] : [app.routes[k], fn]) : fn;

  k = "GET /me";
  fn = async (_req, ctx) => {
    if (!ctx.user) return null;
    return ctx.json(ctx.user);
  };
  app.routes[k] = app.routes[k] ? (Array.isArray(app.routes[k]) ? [...app.routes[k], fn] : [app.routes[k], fn]) : fn;

  k = "GET /logout";
  fn = async (req, ctx) => {
    const { token } = getBearerUser(req, sessions);
    if (!token) return null;
    sessions.delete(token);
    return ctx.json({ status: "Logged out" });
  };
  app.routes[k] = app.routes[k] ? (Array.isArray(app.routes[k]) ? [...app.routes[k], fn] : [app.routes[k], fn]) : fn;
}
