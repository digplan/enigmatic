import { appendFile, readFile } from "node:fs/promises";
import { join } from "node:path";

function isReserved(key) {
  return !key || key.includes(".") || ["login", "logout", "callback", "register", "me"].includes(key) || key.startsWith("llm/");
}

async function load(file) {
  const text = await readFile(file, "utf8").catch(() => "");
  const db = new Map();
  for (const line of text.split("\n")) {
    if (!line) continue;
    let row;
    try { row = JSON.parse(line); } catch { continue; }
    if (row.op === "set") db.set(row.key, row.value);
    if (row.op === "del") db.delete(row.key);
  }
  return db;
}

export default function (app) {
  const dataDir = join(app.path, "data");

  let k = "GET *";
  let fn = async (_req, ctx) => {
    if (isReserved(ctx.key)) return null;
    if (!ctx.user) return ctx.json({ error: "Unauthorized" }, 401);
    const db = await load(join(dataDir, `${ctx.user.sub}.jsonl`));
    return ctx.json(db.get(ctx.key) ?? null);
  };
  app.routes[k] = app.routes[k] ? (Array.isArray(app.routes[k]) ? [...app.routes[k], fn] : [app.routes[k], fn]) : fn;

  k = "POST *";
  fn = async (req, ctx) => {
    if (isReserved(ctx.key)) return null;
    if (!ctx.user) return ctx.json({ error: "Unauthorized" }, 401);
    const value = await req.json().catch(() => null);
    await appendFile(
      join(dataDir, `${ctx.user.sub}.jsonl`),
      `${JSON.stringify({ op: "set", key: ctx.key, value, at: new Date().toISOString() })}\n`
    );
    return ctx.json({ POST: "ok" });
  };
  app.routes[k] = app.routes[k] ? (Array.isArray(app.routes[k]) ? [...app.routes[k], fn] : [app.routes[k], fn]) : fn;

  k = "DELETE *";
  fn = async (_req, ctx) => {
    if (isReserved(ctx.key)) return null;
    if (!ctx.user) return ctx.json({ error: "Unauthorized" }, 401);
    await appendFile(
      join(dataDir, `${ctx.user.sub}.jsonl`),
      `${JSON.stringify({ op: "del", key: ctx.key, at: new Date().toISOString() })}\n`
    );
    return ctx.json({ DELETE: "ok" });
  };
  app.routes[k] = app.routes[k] ? (Array.isArray(app.routes[k]) ? [...app.routes[k], fn] : [app.routes[k], fn]) : fn;
}
