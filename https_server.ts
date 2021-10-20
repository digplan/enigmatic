import { existsSync, readFileSync } from 'fs'
import { IncomingMessage, ServerResponse } from 'http'
import { Http2ServerRequest } from 'http2'
import { createServer } from 'https'

type EndMiddleware = true|false

class HTTPS_SERVER {

    functions = [this.AUTH, this.EVENTS, this.STATIC, this.NOTFOUND]
    tokens = {}
    sse_clients = {}

    listen (port: Number = 443) {
        const options = {
            cert: readFileSync('./keys/localhost-cert.pem'),
            key: readFileSync('./keys/localhost-key.pem')
        }
        const app = (r, s) => {
            this.functions.some((f) => f.apply(this, [r, s]))
        }
        return createServer(options, app).listen(port)
    }

    use (f: (r: IncomingMessage, s: ServerResponse) => EndMiddleware) {
        const db = this
        const func = (r, s) => {
            return f.bind(db, r, s)
        }
        this.functions.unshift(func)
    }

    authorize (userpass: string[]) : {user: string, token: string} {
        return {user: '', token: ''}
    }

    permissions (user: String) : String | false {
        return ''
    }

    AUTH (r: IncomingMessage, s: ServerResponse) : EndMiddleware {
        let [type, val] = r.headers.authorization.split(' ')
        if (type == 'BASIC') {
            const userpass = Buffer.from(val, 'base64').toString('ascii').split(':')
            const { user, token } = this.authorize(userpass)
            if (!user || !token) {
                s.writeHead(401).end()
                return true
            }
            this.tokens[token] = user
            s.end (token)
            return true
        }
        if (type == 'BEARER') {
            if (r.url === '/logout' && this.tokens[val]) {
                delete this.tokens[val]
                s.writeHead (302, 'Location: /').end()
                return true
            }
            const user = this.tokens[val]
            if (!user) {
                s.writeHead(401).end()
                return true
            }
            s.permissions = this.permissions (user)
        }
        return false
    }

    STATIC (r: IncomingMessage, s: ServerResponse) : EndMiddleware {
        if (r.method !== 'GET')
            return false
        const fn = `./public${(r.url == '/') ? '/index.html' : r.url}`
        if (existsSync(fn)) {
            s.end(readFileSync(fn).toString())
            return true
        }
    }

    EVENTS (r: IncomingMessage, s: ServerResponse) : EndMiddleware {
        if (r.url !== '/events')
            return false
        s.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        })
        const conn_id = new Date().toISOString() + Math.random()
        const clients = this.sse_clients
        clients[conn_id] = s
        s.socket.on('close', function () {
            console.log('Client leave')
            delete clients[conn_id]
        })
        return true;
    }

    NOTFOUND (r: IncomingMessage, s: ServerResponse) : EndMiddleware {
        s.writeHead(404).end()
        return true
    }

    sendBroadcast (text: string) : Boolean {
        const clients = this.sse_clients
        for (let client in clients)
            clients[client].write(`data: ${text}\n\n`)
        return true
    }

}

export default HTTPS_SERVER

/*****************
       Tests  
******************/

if (process.argv[1].match('https_server.mjs'))
    tests()

function tests() {
    const server = new HTTPS_SERVER()
    server.listen ()
    console.log (server.functions)
    console.log ('Go to https://localhost')
    console.log ('Go to https://localhost/events')
    console.log ('Go to https://localhost/badurl')
    setInterval (() => server.sendBroadcast('new data'), 1000)
}
