import { readFileSync, readdirSync } from 'node:fs';
import { Server } from 'node:https';

class HTTPSServer extends Server {

    middleware = []
    functions = {}

    constructor(key, cert) {
        super({
            key: readFileSync(key),
            cert: readFileSync(cert),
        })
        this.on('request', (r, s) => {
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
                if (this.functions[r.url]) {
                    return this.functions[r.url](r, s, data)
                }
                return this.functions['/404'](r, s)
            })
        })
    }

    async getMiddleware(func_folder) {
        const middleware_folder = `${func_folder}/middleware`
        for (const model of readdirSync(middleware_folder)) {
            if (!model.endsWith('.mjs')) continue
            let f = await import('file://' + middleware_folder + '/' + model)
            this.middleware.unshift(f.default)
        }
        for (const model of readdirSync(func_folder)) {
            if (!model.endsWith('.mjs')) continue
            const name = model.split('.')[0]
            let f = await import('file://' + func_folder + '/' + model)
            this.functions[`/${name}`] = f.default
        }
        console.log(this.middleware)
        console.log(this.functions)
    }
}

const dirname = new URL(import.meta.url).pathname.split('/').slice(0, -1).join('/').slice(1)
if (process.platform !== 'win32')  dirname = '/' + dirname
const port = 8080

const server = new HTTPSServer('./.server/.secrets/server.key', './.server/.secrets/server.crt')
await server.getMiddleware(dirname + '/.server')
server.listen(port)
console.log(`listening on port ${port}`)