import { readFileSync, writeFileSync } from 'node:fs'
import { Server as S, request, get } from 'node:https'

class Server extends S {
    middleware = []
    constructor() {
        super({
            key: readFileSync('../key.pem'),
            cert: readFileSync('../cert.pem')
        })
        this.on('request', (r, s) => {
            let data = ''
            r.on('data', (s) => {
                data += s.toString()
            })
            r.on('end', () => {
                try { data = JSON.parse(data) } catch (e) { }
                this.middleware.some((f) => {
                    const stop = f(r, s, data)
                    return stop
                })
            })
        })
    }
    use(farr) {
        this.middleware = [...farr, (r, s) => s.writeHead(404).end()]
    }
}

class Client {
    static fetch(url, options = {}) {
        return new Promise((resolve, reject) => {
            get(url, options, (res, socket) => {
                let data = ''
                res.on('connect', (res, socket, head) => {
                    socket.write('okay')
                })
                res.on('data', (d) => { data += d })
                res.on('end', () => {
                    resolve(data)
                })
            })
        })
    }
}

export { Server, Client }