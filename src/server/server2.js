/*
   Web server
*/

import { readdir, readFile } from "node:fs/promises";
import config from '#app/config.json'


globalThis.app = {routes: {always: []}, path: import.meta.path.split('/src')[0]};

for (const name of config.use_plugins) {
  const { default: plugin } = await import(`#plugins/${name}`);
  await plugin(app);
}

// Cache static files (public directory)
const static_htmls = {}
const files = await readdir(`${app.path}/public`);
for(const filename of files) {
  static_htmls[`/${filename}`] = (await readFile(`${app.path}/public/${filename}`)).toString();
}

export default function createServer(options = {}) {
  return { async fetch(req) { 
    const {method, url} = req;

    // Routes
    app.routes.always.forEach(fn => fn(app))
    const matchRoute = app.routes.filter(name => `${method} ${url}` == name)
    if(matchRoute) {
      return matchRoute(req, resp);
    }

    // Static files
    const file = static_htmls[url];
    if (file) {
      const ext = url.split('.')[1];
      return new Response(file, {
        headers: {
          'Content-Type': ext === 'js' ? 'text/javascript' : `text/${ext}`
        }
      });
    }
    
    // Not found
    return new Response("Not Found", { status: 404 });
  },
  port,
  tls: {
    cert: Bun.file(join(certsDir, "cert.pem")),
    key: Bun.file(join(certsDir, "key.pem")),
  }}
}