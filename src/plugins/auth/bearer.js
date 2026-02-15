import { randomUUID } from "crypto";

const sessions = new Map();
const users = new Map();

export function createAuthBearer() {
  const getTokenAndUser = (req) => {
    const auth = req.headers.get("Authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    const user = token ? sessions.get(token) || null : null;
    return { token, user };
  };

  const register = async (req, ctx) => {
    if (ctx.method !== "POST" || ctx.path !== "/register") return null;
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
    return ctx.json({ token, user }, 200, {}, ctx.origin);
  };

  const login = async (req, ctx) => {
    if (ctx.method !== "POST" || ctx.path !== "/login") return null;
    const body = await req.json().catch(() => ({}));
    const sub = body.sub;
    if (!sub || !users.has(sub)) return ctx.json({ error: "User not found" }, 404, {}, ctx.origin);
    const user = users.get(sub);
    const token = randomUUID();
    sessions.set(token, user);
    return ctx.json({ token, user }, 200, {}, ctx.origin);
  };

  const me = async (_req, ctx) => {
    if (ctx.method !== "GET" || ctx.path !== "/me") return null;
    if (!ctx.user) return ctx.json({ error: "Not found" }, 404, {}, ctx.origin);
    return ctx.json(ctx.user, 200, {}, ctx.origin);
  };

  const logout = async (_req, ctx) => {
    if (ctx.method !== "GET" || ctx.path !== "/logout") return null;
    const auth = ctx.req.headers.get("Authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (token) sessions.delete(token);
    return ctx.json({ status: "Logged out" }, 200, {}, ctx.origin);
  };

  const handle = (req, ctx) => register(req, ctx) ?? login(req, ctx) ?? me(req, ctx) ?? logout(req, ctx);

  return {
    routes: {
      "/register": { POST: handle },
      "/login": { POST: handle },
      "/me": { GET: handle },
      "/logout": { GET: handle },
    },
    getTokenAndUser,
  };
}

export const { routes, getTokenAndUser } = createAuthBearer();
