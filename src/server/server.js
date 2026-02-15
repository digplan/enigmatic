import { join } from "path";
import { fileURLToPath } from "url";
import { readdir } from "node:fs/promises";
import { read } from "node:fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const configPath = join(__dirname, "..", "..", "config.json");
const certsDir = join(__dirname, "..", "..", "certs");
const publicDir = join(__dirname, "..", "..", "public");

// Load config
const config = await import(configPath, { assert: { type: "json" } }).then(m => m.default).catch(() => ({
  use_plugins: [],
  port: 3000
}));

const { use_plugins = [], port = 3000 } = config;

// Load Plugins
let routes = {};
for (const name of use_plugins) {
  try {
    const pluginPath = name.startsWith("/") ? name : join(__dirname, "..", "plugins", name);
    const plugin = await import(pluginPath);
    for (const route in plugin) {
      routes[route] = plugin[route];
    }
  } catch (e) {
    console.error(`Failed to load plugin ${name}:`, e.message);
  }
}

// Static files
const htmls = {}
for(const filename of await readdir(publicDir)) {
  htmls[`/${filename}`] = await Bun.file(publicDir + '/' + filename).text();
}

function json(d, s = 200, h = {}, origin) {
  return new Response(JSON.stringify(d), {
    status: s,
    headers: {
      "Access-Control-Allow-Origin": origin ?? "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PURGE, PROPFIND, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
      "Access-Control-Allow-Credentials": "true",
      "Content-Type": "application/json",
      ...h,
    },
  });
}

export function createServer(options = {}) {
  return {
    async fetch(req) {
      const { method, url } = req;
      const requestUrl = new URL(url);
      const pathname = requestUrl.pathname;
      const origin = req.headers.get("Origin") || requestUrl.origin;

      // CORS
      if (method === "OPTIONS") {
        return json(null, 204, {}, origin);
      }

      // Check if there's a route handler for this path
      if (routes[pathname]) {
        if (method === "GET") {
          return new Response(routes[pathname]);
        }
        // If route is a function, call it
        if (typeof routes[pathname] === "function") {
          return await routes[pathname](req);
        }
      }

      // Static file serving (public) or not found
      return htmls[url] ? json(htmls[url], 200) : json({ error: "Not found" }, 404, {}, origin);
    },
    port: config.port,
    tls: {
      cert: Bun.file(join(certsDir, "cert.pem")),
      key: Bun.file(join(certsDir, "key.pem")),
    },
  };
}

export default createServer();
