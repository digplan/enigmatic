const FS = require('fs')

class HTTPS_SERVER {

    functions = []

    listen (port = 443) {
        const PROTOCOL = require('https')
        const options = {
            cert: FS.readFileSync('./localhost-cert.pem'),
            key: FS.readFileSync('./localhost-key.pem')
        }
        const app = (r, s) => {
            this.functions.some((f)=>f(r,s))
        }
        PROTOCOL.createServer(options, app).listen(port)
    }

    use (f) {
        const func = (r, s) => {
            return f(r, s)
        } 
        db.functions.push (func)
    }

    STATIC (r, s) {
        if (r.method == 'GET') {
            const fn = `./public${(r.url == '/') ? '/index.html' : r.url}`
            if (FS.existsSync(fn))
              return s.end(FS.readFileSync(fn).toString())
            s.writeHeader(404)
            return s.end()
        }
    }

    NOTFOUND (r, s) {
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
  const f1 = (r, s)=>s.end('test ok')
  const f2 = (r, s)=>s.end('test ok2')
  [f1, f2].forEach (server.use)
  server.listen ()
  console.log ('Go to https://localhost')
}
