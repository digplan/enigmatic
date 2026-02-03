import { readFile } from "fs/promises";
import { join } from "path";

const defsPath = join(import.meta.dir, "apidefs.jsonl");
let cache = null;

const loadApis = async () => {
  if (cache) return cache;
  try {
    const txt = await readFile(defsPath, "utf8");
    cache = txt
      .trim()
      .split("\n")
      .filter((l) => l && !l.startsWith("#"))
      .map((l) => JSON.parse(l));
  } catch (e) {
    cache = [];
  }
  return cache;
};

const toUrl = (p) => (p.startsWith("http") ? p : `https://${p}`);

function substitute(val, ctx) {
  if (val == null) return val;
  if (typeof val === "string") {
    return val.replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (_, k) => ctx[k] ?? val);
  }
  if (Array.isArray(val)) return val.map((v) => substitute(v, ctx));
  if (typeof val === "object") {
    const out = {};
    for (const k of Object.keys(val)) out[k] = substitute(val[k], ctx);
    return out;
  }
  return val;
}

export async function fetchapi(name, opts = {}) {
  const env = typeof Bun !== "undefined" ? Bun.env : process.env || {};
  const ctx = { ...env, ...opts };
  const list = await loadApis();
  const row = list.find((r) => r[0] === name);
  if (!row) throw new Error(`API ${name} not found`);

  const [_, methodUrl, headersArr, bodyTemplate, extra] = row;
  const colon = methodUrl.indexOf(":");
  const method = colon > 0 ? methodUrl.slice(0, colon) : "POST";
  const urlPart = colon > 0 ? methodUrl.slice(colon + 1) : methodUrl;
  const url = toUrl(urlPart);

  const headers = { "Content-Type": "application/json" };
  if (Array.isArray(headersArr)) {
    for (const h of headersArr) {
      const v = typeof h === "string" ? substitute(h, ctx) : h;
      if (v && !v.includes("$")) headers["Authorization"] = v;
    }
  }

  const body = method !== "GET" ? substitute(bodyTemplate || {}, ctx) : undefined;
  const bodyStr = body != null ? JSON.stringify(body) : undefined;

  const res = await fetch(url, {
    ...extra,
    method: opts.method || method,
    headers: { ...headers, ...opts.headers },
    body: bodyStr,
  });
  return res.json();
}
