/**
 * @example
 * const server = new HTTPS_SERVER ()
 * server.use (server.STATIC)
 * server.use (server.NOTFOUND)
 * server.listen ()
 * 
 * @example
 * // tests
 * node http_server.js
**/

const FS = require ('fs')
class HTTPS_SERVER {

    /**
     * @type {Array<Function(r, s)>} 
     */
    functions = [this.EVENTS, this.STATIC, this.NOTFOUND]

    /**
     * @type {Array<Response>}
     */
    sse_clients = {}

    /**
     * @param {Number} [port=443]
     * @returns {PROTOCOL.Server}
     */

    listen (port = 443) {
        const FS = require('fs')
        const PROTOCOL = require('https')
        const options = {
            cert: FS.readFileSync('./localhost-cert.pem'),
            key: FS.readFileSync('./localhost-key.pem')
        }
        const app = (r, s) => {
            this.functions.some((f) => f.apply (this, [r, s]))
        }
        return PROTOCOL.createServer(options, app).listen(port)
    }

    /**
     * @param {Function} f
     */

    use (f) {
        const db = this
        const func = (r, s) => {
            return f.bind (db, r, s)
        }
        this.functions.unshift(func)
    }

    /**
     * @param {Request} r 
     * @param {Response} s 
     * @returns {Boolean} Returning true will end the middleware
     */

    STATIC (r, s) {
        if (r.method !== 'GET')
            return false
        const fn = `./public${(r.url == '/') ? '/index.html' : r.url}`
        return FS.existsSync(fn) ? s.end(FS.readFileSync(fn).toString()) : false
    }

    EVENTS (r, s) {
        if (r.url !== '/events')
            return false
        //console.log('new sse client')
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

    NOTFOUND (r, s) {
        s.writeHead(404).end()
    }

    sendBroadcast (text) {
        const clients = this.sse_clients
        for(let client in clients)
            clients[client].write (`data: ${text}\n\n`)
    }

}

module.exports = HTTPS_SERVER

/*****************
       Tests  
******************/

if (require.main === module)
    tests()

function tests () {
    const server = new HTTPS_SERVER()
    server.listen()
    console.log(server.functions)
    console.log('Go to https://localhost')
    setInterval(()=>server.sendBroadcast('new data'), 1000)
}
