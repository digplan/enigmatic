import { readFileSync, readdirSync, existsSync, exists } from 'node:fs';
import { Server } from 'node:https';

let dir = process.cwd()
let dir_key = `${dir}/../keys/key.pem`
let dir_cert = `${dir}/../keys/cert.pem`

class HTTPSServer extends Server {
    middleware = []
    routes = {}
    debug = process.env.debug || false
    constructor(key, cert) {
        super({
            key: readFileSync(dir_key),
            cert: readFileSync(dir_cert),
        })
        this.on('request', (r, s) => {
            try {
                if (this.debug) console.log(`${r.method} ${r.url}`)
                let data = ''
                r.on('data', (s) => {
                    data += s.toString()
                })
                r.on('end', () => {
                    s.endJSON = (obj) => {
                        s.end(JSON.stringify(obj))
                    }
                    try { data = JSON.parse(data) } catch (e) { }
                    if (r.url == '/') r.url = '/index.mjs'

                    for(const m of this.middleware)
                        this.middleware[m](r, s, data, server, this.db)

                    const route = this.routes['/' + r.url.split('/')[1]]
                    if (!route)
                        return s.writeHead(404).end()

                    return route(r, s, data, server, this.db)
                })
            } catch (e) {
                console.log(e)
                s.writeHead(500).end()
            }
        }
        )
    }
    async getMiddleware() {
        let f = await import('routes.mjs')
        for (const midf in f.default) {
            midf.startsWith('_') ? this.middleware[midf] = f.default[midf] : this.routes[`/${midf}`] = f.default[midf]
        }
    }
}

export { HTTPSServer }