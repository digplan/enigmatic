const PROTOCOL = require('https')
const FS = require('fs')
const READLINE = require('readline')

const DB = {
    init: ()=> {
        if(!FS.existsSync('./data.txt'))
          FS.writeFileSync('./data.txt', `edb ${new Date().toISOString()}`)
        DB.build()
    },
    build: async ()=> {
        const rl = READLINE.createInterface({
            input: FS.createReadStream('./data.txt'),
            crlfDelay: Infinity
        })
        for await (const line of rl) {
            let [time, type, obj] = line.split('\t')
            if(obj)
              DB.processLine(type, JSON.parse(obj))
        }
    },
    transaction: (type, obj)=> {
      if(type == 'GET')
        return DB.DATA
      if(obj) obj = JSON.parse(obj)
      const ret = DB.processLine(type, obj)
      FS.appendFileSync('./data.txt', `\r\n${new Date().toISOString()}\t${type}\t${JSON.stringify(obj)}`)
      return ret
    },
    processLine: (type, obj)=> {
      if(type == 'POST'){
        const id = +new Date()
        obj._id = id
        DB.DATA[id] = obj
        return DB.DATA[id]
      }
      if(type == 'PUT') {
        DB.DATA[obj._id] = obj
        return DB.DATA[obj._id]
      }
      if(type == 'DELETE'){
        delete DB.DATA[obj._id]
        return obj
      }
      return;
    },
    DATA: {}
}

DB.init()

const options = {
    cert: FS.readFileSync('./localhost.pem'),
    key: FS.readFileSync('./localhost-key.pem')
}

const app = (r, s) => {

    //console.log([r.method, r.url]);

    try {
        
        if (r.url.match('/api')) {
            var body = ''
            r.on('data', (datain) => body += datain)
            r.on('end', () => {
                var x = DB.transaction(r.method, body)
                s.end(JSON.stringify(x))
            })
            return;
        }

        if (r.method == 'GET') {

            if (r.url == '/' || r.url == '/index.html')
                return s.end(FS.readFileSync('./index.html').toString());

            else if (r.url == '/index.js')
                return s.end(FS.readFileSync('./index.js').toString());

            else if (r.url == '/enigmatic.css')
                return s.end(FS.readFileSync('./enigmatic.css').toString());

            else if (r.url == '/data')
                return s.end(JSON.stringify(DATA, null, 2))

            else if (r.url == '/events') {
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
            }
        }

        if(!r.method.match(/POST|PUT|DELETE/i))
            return s.end('')

    } catch (e) {
        s.end('Error ' + e.message);
    }
}

const server = PROTOCOL.createServer(options, app).listen(443)
console.log(server)