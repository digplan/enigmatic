import { readFileSync, readdirSync, existsSync, exists } from 'node:fs';
import { Server } from 'node:https';

let dir = process.cwd()
let dir_key = `${dir}/../keys/key.pem`
let dir_cert = `${dir}/../keys/cert.pem`
let dir_middleware = `file://${dir}/middleware`
let dir_routes = `file://${dir}/routes`

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
                    r.server = this
                    this.middleware.some((f) => {
                        if (this.debug) console.log(`middleware: ${f.name}`)
                        return f(r, s, data)
                    })
                    if (r.url == '/') r.url = '/index.mjs'
                    const route = this.routes['/' + r.url.split('/')[1]]
                    if (this.debug) console.log(`route: ${r.url}`)
                    if (!route)
                        return this.routes['/404'](r, s, data)
                    if (route.toString().startsWith('class')) {
                        const f = new route(), method = r.method.toLowerCase()
                        if (!f[method])
                            return s.writeHead(405).end()
                        return f[method](r, s, data)
                    }
                    return route(r, s, data)
                })
            } catch (e) {
                console.log(e)
                s.writeHead(500).end()
            }
        }
        )
    }
    async getMiddleware() {
        const mfiles = []
        if (existsSync('./middleware')) {
            for (const model of readdirSync('./middleware'))
                mfiles.push(model)
            mfiles.sort((a, b) => a.localeCompare(b))
            for (const model of mfiles) {
                if (!model.endsWith('.mjs')) continue
                let f = await import(`${dir_middleware}/${model}`)
                this.middleware.unshift(f.default)
            }
        }
        if (existsSync('./routes')) {
            for (const model of readdirSync('./routes')) {
                if (!model.endsWith('.mjs')) continue
                const name = model.split('.')[0]
                let f = (await import(`${dir_routes}/${model}`)).default
                this.routes[`/${name}`] = f
            }
        }
        if (existsSync('./routes.mjs')) {
            let f = await import('../routes.mjs')
            for (const midf in f.default) {
                midf.startsWith('_') ? this.middleware[midf] = f.default[midf] : this.routes[`/${midf}`] = f.default[midf]
            }
        }
    }
}

class Route {
    constructor(r, s, data) { }
    route(r, s, data) {
        this[r.method](r, s, data)
    }
}

export { HTTPSServer, Route }