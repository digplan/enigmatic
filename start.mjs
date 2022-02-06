import { readFileSync, readdirSync } from 'node:fs';
import { Server } from 'node:https';

const dirname = new URL(import.meta.url).pathname.split('/').slice(0, -1).join('/').slice(1),
 folder = '/.server',
 cert = './.server/.secrets/server.crt',
 key = './.server/.secrets/server.key'
 
if (process.platform !== 'win32')
    dirname = '/' + dirname

class HTTPSServer extends Server {

    middleware = []
    functions = {}

    constructor() {
        this.getMiddleware(dirname)

        super({
            key: readFileSync(cert),
            cert: readFileSync(key),
        })

        this.on('request', (r, s) => {
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
                if(this.functions[r.url]) {
                    this.functions[r.url](r, s, data)
                }
            })
        })
    }

    async getMiddleware(dirname) {
        for (const model of readdirSync(dirname + folder)) {
            if (!model.endsWith('.mjs')) continue

            let furl = 'file://' + dirname + '/middleware/' + model
            let f = await import(furl);

            if(model.startsWith('_')) { 
                this.middleware.unshift(f.default)
            } else {
                const name = model.split('.')[0]
                this.functions[`/${name}`] = f.default
            }
        }
    }
}