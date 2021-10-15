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

class HTTPS_SERVER {

    /**
     * @type {Array<Function(r, s)>} 
     */
    functions = []

    /**
     * @type {Array<Response>}
     */
    sse_clients = []

    /**
     * @param {Number} [port=443]
     * @returns {PROTOCOL.Server}
     */

    listen(port = 443) {
        const FS = require('fs')
        const PROTOCOL = require('https')
        const options = {
            cert: FS.readFileSync('./localhost-cert.pem'),
            key: FS.readFileSync('./localhost-key.pem')
        }
        this.functions.push(this.NOTFOUND)
        const app = (r, s) => {
            this.functions.some((f) => f.bind(this, r, s))
        }
        return PROTOCOL.createServer(options, app).listen(port)
    }

    /**
     * @param {Function} f
     */

    use(f) {
        const func = (r, s) => {
            return f.bind(this, r, s)
        }
        this.functions.push(func)
    }

    /**
     * @param {Request} r 
     * @param {Response} s 
     * @returns {Boolean} Returning true will end the middleware
     */

    STATIC(r, s) {
        if (r.method === 'GET')
            return false
        const fn = `./public${(r.url == '/') ? '/index.html' : r.url}`
        if (FS.existsSync(fn)) {
            return s.end(FS.readFileSync(fn).toString())
        }
        s.writeHeader(404)
        return s.end()
    }

    EVENTS(r, s) {
        if (r.url !== '/events')
            return false
        console.log('new sse client')
        s.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        })
        HTTPS_SERVER.sse_clients.push(s)
        console.log(this.clients)
        s.socket.on('close', function () {
            console.log('Client leave')
        })
        return true;
    }

    sendEvent(data) {
        if(!this.sse_clients.length)
          return
        for (let client of this.sse_clients)
            client.write(`data: ${data}\n\n`)
    }

    /**
     * 
     * @param {Request} r 
     * @param {Response} s 
     * @returns {Boolean} Returning true will end the middleware
     */

    NOTFOUND(r, s) {
        s.writeHeader(404)
        return s.end()
    }

}

module.exports = HTTPS_SERVER

/*****************
       Tests  
******************/

if (require.main === module)
    tests()

async function tests() {
    const server = new HTTPS_SERVER()
    const f1 = (r, s) => s.end('test ok')
    server.use(server.EVENTS)
    server.listen()
    console.log(server.functions)
    console.log('Go to https://localhost')
    server.sendEvent('new data')
}
