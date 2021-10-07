/*
  https.js
  
  Include:
  const HTTPS = require('./https.js')
  const https = new HTTPS()

  Tests:
  > node https.js

*/

class HTTPS {

    functions = []

    listen () {
        const PROTOCOL = require('https')
        const FS = require('fs')
        const options = {
            cert: FS.readFileSync('./localhost-cert.pem'),
            key: FS.readFileSync('./localhost-key.pem')
        }
        const app = (r, s) => {
            for(let f of this.functions){
                f(r, s)
            }
        }
        PROTOCOL.createServer(options, app).listen(443)
    }

    use (f) {
        this.functions.push(f)
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
