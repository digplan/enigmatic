const PROTOCOL = require('https')
const FS = require('fs')
const DB = require('./db.js')
DB.init()

const options = {
    cert: FS.readFileSync('./localhost.pem'),
    key: FS.readFileSync('./localhost-key.pem')
}

const app = (r, s) => {

    try {

        var api = r.url.match(/^\/api\/(.*)/)

        if (api && api[1]) {
            var body = ''
            r.on('data', (datain) => body += datain)
            r.on('end', () => {
                var x = DB.transaction(r.method, body, api[1])
                s.end(JSON.stringify(x))
            })
            return;
        }

        if (r.url == '/events') {
                s.writeHead(200, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    Connection: 'keep-alive'
                })

                var t = setInterval(()=>{
                    DATA = {time: new Date()}
                    s.write(`data: ${JSON.stringify(DATA)}`)
                    s.write('\n\n')
                    console.log(`SENDING EV`)
                }, 500)

                s.socket.on('close', function () {
                    console.log('Client leave')
                    clearInterval(t)
                })
                return;
        }

        if(r.method == 'GET'){
            const fn = './public' + r.url
            if(!FS.existsSync(fn))
              return s.end(404, 'not found')
            return s.end(FS.readFileSync(fn).toString())
        }

        return s.end('not implemented')

    } catch (e) {
        s.end('Error ' + e.message);
    }

}

const server = PROTOCOL.createServer(options, app).listen(443)
console.log(server)