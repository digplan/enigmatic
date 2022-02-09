import { readFileSync, readdirSync } from 'node:fs';
import { Server } from 'node:https';

class HTTPSServer extends Server {
    middleware = []
    routes = {}
    constructor(key, cert) {
        super({
            key: readFileSync(key),
            cert: readFileSync(cert),
        })
        this.on('request', (r, s) => {
            try {
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
                        return f(r, s, data)
                    })
                    const route = this.routes[r.url]
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
        for (const model of readdirSync('./middleware')) {
            if (!model.endsWith('.mjs')) continue
            let f = await import(`./middleware/${model}`)
            this.middleware.unshift(f.default)
        }
        for (const model of readdirSync('./routes')) {
            if (!model.endsWith('.mjs')) continue
            const name = model.split('.')[0], path = `./routes/${model}`
            let f = (await import(path)).default
            //if (typeof f === 'function') {
            this.routes[`/${name}`] = f
            //}   else {
            this.routes[`/${name}`] = f
            // }
        }
    }
}

class Route {
    constructor(r, s, data) { }
    route(r, s, data) {
        console.log('routing ' + this[r.method])
        this[r.method](r, s, data)
    }
}

export { HTTPSServer, Route }