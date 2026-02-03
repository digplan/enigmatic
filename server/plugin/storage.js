import { appendFile, mkdir, readFile } from "fs/promises";
import { join } from "path";

/**
 * KV storage plugin: GET/POST/DELETE on any path (key = path.slice(1)); auth required.
 * Convention: routes + handle(req, ctx). See plugin/README.md.
 */
export function createStorage(kvDir) {
  const userKv = {};
  const kvPath = (sub) => join(kvDir, `${String(sub).replace(/[^a-zA-Z0-9_-]/g, "_")}.jsonl`);

  const getUserMap = async (sub) => {
    if (userKv[sub]) return userKv[sub];
    const m = new Map();
    try {
      let buf = await readFile(kvPath(sub), "utf8");
      if (buf.charCodeAt(0) === 0xfeff) buf = buf.slice(1);
      for (const line of buf.trim().split("\n").filter(Boolean)) {
        try {
          const row = JSON.parse(line);
          if (Array.isArray(row) && row.length >= 2) m.set(row[0], row[1]);
          else if (row?.action === "update") m.set(row.key, row.value);
          else if (row?.action === "delete") m.delete(row.key);
        } catch {}
      }
    } catch {}
    userKv[sub] = m;
    return m;
  };

  const saveUserKv = async (sub, action, key, value) => {
    await mkdir(kvDir, { recursive: true });
    const ts = new Date().toISOString();
    const row = action === "update" ? { action, key, value, timestamp: ts } : { action, key, timestamp: ts };
    await appendFile(kvPath(sub), JSON.stringify(row) + "\n");
  };

  const handle = async (req, ctx) => {
    if (!ctx.user) return null;
    const { method, key, json } = ctx;
    const m = await getUserMap(ctx.user.sub);
    if (method === "GET") return json(m.get(key) ?? null, 200, {}, ctx.origin);
    if (method === "POST") {
      const val = await req.text();
      const v = (() => {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      })();
      m.set(key, v);
      await saveUserKv(ctx.user.sub, "update", key, v);
      return json({ key, value: v }, 200, {}, ctx.origin);
    }
    if (method === "DELETE") {
      m.delete(key);
      await saveUserKv(ctx.user.sub, "delete", key);
      return json({ status: "Deleted" }, 200, {}, ctx.origin);
    }
    return null;
  };

  return {
    routes: { "*": { GET: handle, POST: handle, DELETE: handle } },
    handle,
    getUserMap,
    saveUserKv,
  };
}

// Pre-initialized export using the server's kv directory
export const { routes } = createStorage(join(import.meta.dir, "..", "kv"));
