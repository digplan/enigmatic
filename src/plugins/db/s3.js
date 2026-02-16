import { S3Client } from "bun";

export default function (app) {
  const env = Bun.env;
  const need = ["CLOUDFLARE_ACCESS_KEY_ID", "CLOUDFLARE_SECRET_ACCESS_KEY", "CLOUDFLARE_BUCKET_NAME", "CLOUDFLARE_PUBLIC_URL"];
  app.requiredEnvs = [...(app.requiredEnvs || []), ...need];
  
  if (need.some((k) => !env[k])) return;

  const s3 = new S3Client({
    accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
    bucket: env.CLOUDFLARE_BUCKET_NAME,
    endpoint: env.CLOUDFLARE_PUBLIC_URL,
  });

  let k = "PUT *";
  let fn = async (req, ctx) => {
    if (!ctx.user) return ctx.json({ error: "Unauthorized" }, 401);
    if (!ctx.key) return null;
    await s3.write(`${ctx.user.sub}/${ctx.key}`, req.body);
    return ctx.json({ status: "Saved to R2" });
  };
  app.routes[k] = app.routes[k] ? (Array.isArray(app.routes[k]) ? [...app.routes[k], fn] : [app.routes[k], fn]) : fn;

  k = "PURGE *";
  fn = async (_req, ctx) => {
    if (!ctx.user) return ctx.json({ error: "Unauthorized" }, 401);
    if (!ctx.key) return null;
    await s3.delete(`${ctx.user.sub}/${ctx.key}`);
    return ctx.json({ status: "Deleted from R2" });
  };
  app.routes[k] = app.routes[k] ? (Array.isArray(app.routes[k]) ? [...app.routes[k], fn] : [app.routes[k], fn]) : fn;

  k = "PROPFIND *";
  fn = async (_req, ctx) => {
    if (!ctx.user) return ctx.json({ error: "Unauthorized" }, 401);
    const out = await s3.list({ prefix: `${ctx.user.sub}/` });
    const items = Array.isArray(out) ? out : out?.contents || [];
    return ctx.json(items.map((i) => ({
      name: (i.key || i.Key || "").split("/").pop(),
      size: i.size ?? i.Size ?? 0,
      lastModified: i.lastModified || i.LastModified || null,
    })));
  };
  app.routes[k] = app.routes[k] ? (Array.isArray(app.routes[k]) ? [...app.routes[k], fn] : [app.routes[k], fn]) : fn;

  k = "PATCH *";
  fn = async (_req, ctx) => {
    if (!ctx.user) return ctx.json({ error: "Unauthorized" }, 401);
    if (!ctx.key) return null;
    const key = `${ctx.user.sub}/${ctx.key}`;
    if (!(await s3.exists(key))) return ctx.json({ error: "File not found" }, 404);
    const f = await s3.file(key);
    return new Response(f.stream(), {
      headers: {
        ...Object.fromEntries((f.headers && [...f.headers.entries()]) || []),
        "Access-Control-Allow-Origin": ctx.origin,
        "Access-Control-Allow-Credentials": "true",
      },
    });
  };
  app.routes[k] = app.routes[k] ? (Array.isArray(app.routes[k]) ? [...app.routes[k], fn] : [app.routes[k], fn]) : fn;
}
