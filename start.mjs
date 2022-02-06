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
            console.log('incoming request')
            let data = ''
            r.on('data', (s) => {
                data += s.toString()
            })
            r.on('end', () => {
                try { data = JSON.parse(data) } catch (e) { }
                r.server = this
                this.middleware.some((f) => {
                    return f(r, s, data)
                })
                if (this.functions[r.url]) {
                    return this.functions[r.url](r, s, data)
                }
                return this.functions('/404')
            })
        })
    }

    async getMiddleware(midfolder) {
        for (const model of readdirSync(midfolder)) {
            if (!model.endsWith('.mjs')) continue

            let f = await import('file://' + midfolder + '/' + model)
            if (model.startsWith('_')) {
                this.middleware.unshift(f.default)
            } else {
                const name = model.split('.')[0]
                this.functions[`/${name}`] = f.default
            }
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