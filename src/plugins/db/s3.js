import { S3Client } from "bun";

/**
 * S3/R2 plugin: PUT (write), PURGE (delete), PROPFIND (list), PATCH (download); auth required.
 * Convention: routes + handle(req, ctx). See plugin/README.md.
 */
export function createS3(env) {
  const need = ["CLOUDFLARE_ACCESS_KEY_ID", "CLOUDFLARE_SECRET_ACCESS_KEY", "CLOUDFLARE_BUCKET_NAME", "CLOUDFLARE_PUBLIC_URL"];
  const missing = need.filter((k) => !env?.[k]);
  if (missing.length) throw new Error(`Missing env: ${missing.join(", ")}`);

  const client = new S3Client({
    accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
    bucket: env.CLOUDFLARE_BUCKET_NAME,
    endpoint: env.CLOUDFLARE_PUBLIC_URL,
  });

  const write = (k, b) => client.write(k, b);
  const del = (k) => client.delete(k);
  const list = async (opts) => {
    const prefix = typeof opts === "string" ? opts : opts?.prefix;
    return client.list(prefix ? { prefix: prefix.endsWith("/") ? prefix : `${prefix}/` } : {});
  };
  const exists = (k) => client.exists(k);
  const file = async (k) => {
    const f = await client.file(k);
    return f ? { stream: () => f.stream(), headers: f.headers } : null;
  };

  const handle = async (req, ctx) => {
    if (!ctx.user) return null;
    const { method, key, json, origin } = ctx;
    const s3Key = `${ctx.user.sub}/${key}`;

    if (method === "PUT") {
      await write(s3Key, req.body);
      return json({ status: "Saved to R2" }, 200, {}, origin);
    }
    if (method === "PURGE") {
      await del(s3Key);
      return json({ status: "Deleted from R2" }, 200, {}, origin);
    }
    if (method === "PROPFIND") {
      const listResult = await list({ prefix: ctx.user.sub });
      const items = Array.isArray(listResult) ? listResult : listResult?.contents ?? [];
      return json(
        items.map((i) => ({
          name: i.key?.split("/").pop() || i.name || i.Key,
          lastModified: i.lastModified || i.LastModified,
          size: i.size ?? i.Size ?? 0,
        })),
        200,
        {},
        origin
      );
    }
    if (method === "PATCH") {
      try {
        if (!(await exists(s3Key))) return json({ error: "File not found" }, 404, {}, origin);
        const f = await file(s3Key);
        if (!f) return json({ error: "File not found" }, 404, {}, origin);
        const headers = {
          ...Object.fromEntries((f.headers && f.headers.entries && [...f.headers.entries()]) || []),
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
        };
        return new Response(f.stream(), { headers });
      } catch (e) {
        return json({ error: "File not found", details: e.message }, 404, {}, origin);
      }
    }
    return null;
  };

  return {
    routes: { "*": { PUT: handle, PURGE: handle, PROPFIND: handle, PATCH: handle } },
    handle,
    write,
    delete: del,
    list,
    exists,
    file,
  };
}

// Pre-initialized export using Bun.env
export const { routes } = createS3(Bun.env);
