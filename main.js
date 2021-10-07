
// main.js

const DBAPI = (r, s, DB) => {
    if (r.url === '/api' && r.method === 'GET')
        return s.end(JSON.stringify(DB.DATA))

    if (r.url === '/api' && r.method.match(/POST|PUT|DELETE/)) {
        var body = ''
        r.on('data', (datain) => body += datain)
        r.on('end', () => {
            var x = DB.transaction(r.method, body, api[1])
            s.end(JSON.stringify(x))
        })
        return true
    }

    if (r.url === '/events') {
        s.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        })
    
        DB.txEvent = (line) => {
            s.write(`data: ${line}`)
            s.write('\n\n')
        }
    
        s.socket.on('close', function () {
            console.log('Client leave')
        })
    
        return true;
    }

    return false
}


(async () => {
    const DATABASE = require('./db.js')
    const db = new DATABASE()
    await db.init()

    const HTTPS = require('./https_server.js')
    const server = new HTTPS()
    
    server.use(DBAPI, db)
    server.use(server.STATIC)
    server.use(server.NOTFOUND)
    server.listen()

    setInterval(()=>{
        db.transaction('POST', `[{"_type": "_identity", "name": "testtx"}]`)
    }, 3000)
})()