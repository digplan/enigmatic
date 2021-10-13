
// main.js

(async () => {
    const DATABASE = require('./db.js')
    const db = new DATABASE()
    await db.init()
    db.listen(444)

    const HTTPS = require('./https_server.js')
    const server = new HTTPS()
    server.use(server.STATIC)
    server.use(server.NOTFOUND)
    server.listen()

    setInterval(()=>{
        db.transaction('POST', `[{"_type": "_identity", "name": "testtx"}]`)
    }, 3000)
})()