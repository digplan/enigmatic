/*
  https.js
  
  Include:
  const HTTPS = require('./https.js')
  const https = new HTTPS()

  Tests:
  > node https.js

*/

const FS = require('fs')

class HTTPS {

    functions = []

    listen () {
        const PROTOCOL = require('https')
        const options = {
            cert: FS.readFileSync('./localhost-cert.pem'),
            key: FS.readFileSync('./localhost-key.pem')
        }
        const app = (r, s) => {
            for(let f of this.functions){
                if(f(r, s))
                  return
            }
        }
        PROTOCOL.createServer(options, app).listen(443)
    }

    use (f, param) {
        const func = (r, s, p) => {
            return f(r, s, param)
        } 
        this.functions.push(func)
    }

    STATIC (r, s) {
        if (r.method == 'GET') {
            if(r.url == '/')
              r.url = '/index.html'
            const fn = `./public/${r.url}`
            if (!FS.existsSync(fn)){
                s.writeHeader(404)
                return s.end()
            }
            s.end(FS.readFileSync(fn).toString())
            return true
        }
    }

    NOTFOUND (r, s) {
        s.writeHeader(404)
        return s.end()
    }

}

module.exports = HTTPS

/*****************
       Tests  
******************/

if (require.main === module)
    tests()

async function tests() {
  const server = new HTTPS()
  server.use((r, s)=>s.end('test ok'))
  server.listen()
  console.log('Go to https://localhost')
}
