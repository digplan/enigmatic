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
        const app = (r, s) => {
            this.functions.some((f) => f(r, s))
        }
        return PROTOCOL.createServer(options, app).listen(port)
    }

    /**
     * @param {Function} f
     */

    use(f) {
        const func = (r, s) => {
            return f(r, s)
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
            return false)
        const fn = `./public${(r.url == '/') ? '/index.html' : r.url}`
        if (FS.existsSync(fn)) {
            return s.end(FS.readFileSync(fn).toString())
        }
        s.writeHeader(404)
        return s.end()
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
    const f2 = (r, s) => s.end('test ok2')
    server.use(f1)
    server.use(f2)
    console.log(server.functions)
    server.listen()
    console.log('Go to https://localhost')
}
