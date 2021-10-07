
// main.js

const DBAPI = (r, s) => {
    if (r.url !== '/api')
        return false

    if (r.method == 'GET') {
        return db.DATA
    }

    if (r.method.match(/POST|PUT|DELETE/)) {
        var body = ''
        r.on('data', (datain) => body += datain)
        r.on('end', () => {
            var x = db.transaction(r.method, body, api[1])
            s.end(JSON.stringify(x))
        })
    }

    s.writeHeader(405) // Method not implemented
    return s.end()
}

const SSE = (r, s) => {
    if (r.url !== '/events')
        return false

    s.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    })

    var t = setInterval(() => {
        DATA = { time: new Date() }
        s.write(`data: ${JSON.stringify(DATA)}`)
        s.write('\n\n')
        console.log(`SENDING EV`)
    }, 500)

    s.socket.on('close', function () {
        console.log('Client leave')
        clearInterval(t)
    })

    return true;
}

(async () => {
    const DATABASE = require('./db.js')
    const db = new DATABASE()
    await db.init()

    const HTTPS = require('./https_server.js')
    const server = new HTTPS()

    server.use(DBAPI, db)
    server.use(SSE)
    server.use(server.STATIC)
    server.use(server.NOTFOUND)

    server.listen()
})()