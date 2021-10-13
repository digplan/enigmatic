/*
  db.js
  
  Include:
  const DB = require('./db.js')
  const db = new DB(filename)
  db.init(version)

  Tests:
  > node db.js

*/

const FS = require('fs')
const CRYPTO = require('./crypto.js')
const crypto = new CRYPTO()

class DB {

    dbversion = 'v0.0.1'
    filename = ''
    DATA = []
    txEvent = () => { }
    lastline = ''
    tokens = {}
    schema = {}
    functions = []

    constructor(filename = './data.txt') {
        this.filename = filename
        if (!FS.existsSync(filename)) {
            FS.writeFileSync(filename, `edb ${this.dbversion}`)
            console.log(`edb public key is ${crypto.public}`)
            console.log(`edb public key (compressed) is ${crypto.public_compressed}`)
            console.log(`edb private key is ${crypto.private}`)
            this.transaction('POST', [
                { _type: '_schema', name: '_identity', field: ['name', 'public'] },
                { _type: '_schema', name: '_role', field: ['name'] },
                { _type: '_schema', name: '_identityrole', field: ['identity', 'role'] },
                { _type: '_schema', name: '_grant', field: ['role', 'permission'] },
                { _type: '_identity', name: 'edbroot', public: crypto.public_compressed },
                { _type: '_role', name: 'edbrole' },
                { _type: '_identityrole', identity: 'edbroot', role: 'edbrole' },
                { _type: '_grant', role: 'edbrole', field: 'id^.*$' }
            ])
        }
        return this
    }

    async init(version) {
        this.DATA = []
        const rl = require('readline').createInterface({
            input: FS.createReadStream(this.filename),
            crlfDelay: Infinity
        })

        for await (const line of rl) {
            let [time, type, obj] = line.split('\t')
            if (obj && (!version || (new Date(time) <= new Date(version))))
                this.buildStep(type, JSON.parse(obj))
        }
    }

    query(s) {
        const qq = s.split('^')
        const f = new Function('i', `return i.${qq[0]}&&i.${qq[0]}.match(/^${qq[1]}/)`)
        return this.DATA.filter(f)
    }

    querystr(s) {
        const def = s.split('@@')
        let temp = JSON.parse(JSON.stringify(this.DATA));
        for (const cond of def) {
            temp = this.query(cond)
        }
        return temp
    }

    validateTx(arr) {
        for (let rec of arr) {
            const type = rec._id.split('.')[0]
            const validfields = this.schema[rec.type]
            const fields = Object.keys(rec)
            for (let f of fields) {
                if (!validfields.includes(f))
                    return 'bad field ' + f
            }
            for (let v of validfields) {
                if (!v.startsWith('!'))
                    continue
                if (!fields.includes('!' + v))
                    return 'required field ' + v
            }
        }
        return false
    }

    transaction(type, arr) {
        if (typeof arr == 'string')
            arr = JSON.parse(arr)

        validateTx(arr)

        let ret = []
        for (let rec of arr) {
            const hash = crypto.hash(this.lastline + JSON.stringify(rec)).slice(32).toUpperCase()
            const id = hash.substring(0, 6)

            let obj = {}
            obj._id = (type == 'POST') ? `${rec._type}.${id}` : rec._id
            delete rec._type

            for (let i in rec)
                obj[i] = rec[i]
            ret.push(obj)

            const txLine = `${new Date().toISOString()}\t${type}\t${JSON.stringify(obj)}\t${hash}`
            FS.appendFileSync(this.filename, `\r\n${txLine}`)
            this.buildStep(type, obj)
            this.txEvent(txLine)
            this.lastline = txLine
        }

        return ret
    }

    buildStep(type, obj) {
        if (type === 'POST')
            return this.DATA.push(obj)
        if (type === 'PUT') {
            for (var i = 0; i < this.DATA.length; i++) {
                if (this.DATA[i]._id == obj._id) {
                    this.DATA[i] = obj
                }
            }
            return
        }
        if (type === 'DELETE')
            return this.DATA = this.DATA.filter(i => i._id != obj._id)

        if (obj._id.match(/^schema/)) {
            if (type.match(/POST|PUT/))
                this.schema[obj.name] = obj.fields
            if (type === 'DELETE')
                delete this.schema[obj.name]
        }
    }

    getToken(username, pass) {
        pass = crypto.hash(pass)
        const finduser = this.query(`name^${username}|pass^${pass}`)
        if (!finduser[0])
            return false
        const token = crypto.hash(Math.random())
        for (idrole in this.query('identityrole',))

            return token
    }

    listen(port = 443) {
        const PROTOCOL = require('https')
        const options = {
            cert: FS.readFileSync('./localhost-cert.pem'),
            key: FS.readFileSync('./localhost-key.pem')
        }
        const app = (r, s) => {
            for (let f of this.functions) {
                if (f(r, s))
                    return
            }
        }
        this.use (this.token)
        this.use (this.q)
        this.use (this.api)
        this.use (this.events)
        PROTOCOL.createServer(options, app).listen(port)
    }

    use(f) {
        const func = (r, s, p) => {
            return f(r, s)
        }
        this.functions.push(func)
    }

    token (r, s) {
        const b64 =  r.headers.authorization.split(' ')[1]
        const creds = Buffer.from(b64, 'base64').toString('ascii')
        const [user, pass] = creds.split(':')
        const passhashed = crypto.hash(crypto.hash(pass))
        const q = this.query(`_id^_identity\.&&pass_hash^${passhashed}$`)
        if(!q || !q[1])
          return false
        const token = crypto.hash(+new Date()+Math.random())
        return s.end(`[{"token": "${token}"}]`)
    }

    q(r, s) {
        const mat = r.url.match(/\/q\/<?query>(.*)/)
        if (!mat.groups.query || r.method !== 'GET')
            return false
        const ret = DB.query(mat.groups.query)
        return s.end(JSON.stringify(ret))
    }

    api(r, s) {
        if (r.url !== '/api' || !r.method.match(/POST|PUT|DELETE/))
            return false
        let body = ''
        r.on('data', (datain) => body += datain)
        r.on('end', () => {
            const x = DB.transaction(r.method, body)
            s.end(JSON.stringify(x))
        })
        return true
    }

    events(r, s) {
        if (r.url !== '/events')
            return false
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

}

module.exports = DB

/*****************
       Tests  
******************/

if (require.main === module)
    tests()

async function tests() {

    console.log('testing')

    // Remove previous tests
    if (FS.existsSync(`./TESTING-eDB.txt`))
        FS.unlinkSync(`./TESTING-eDB.txt`)

    const DB = require('./db.js')
    const db = new DB(`./TESTING-eDB.txt`)

    // Build
    await db.init()
    console.log(`db is located at ${db.filename} and has ${db.DATA.length} records`)
    console.log(JSON.stringify(db.DATA, null, 2))

    // New user

    // Grant to new user

    // Transaction types
    const id = db.transaction('POST', [{ _type: 'fruit', name: 'apples' }])[0]._id
    const txPut = db.transaction('PUT', [{ _id: id, color: 'red' }])
    const idd = db.transaction('POST', [{ _type: 'fruit', name: 'orange' }])[0]._id
    const txDelete = db.transaction('DELETE', [{ _id: idd }])

    // Schema

    // Query
    console.log(db.DATA)
    const qr = db.querystr('_id^frui@@color^red$')
    console.log(qr)

    // Server
    db.listen()

    // New user

    // Get token

    // Server query

    // Server transaction types

    // Server events

    // Server query with version

}
