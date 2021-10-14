/**
 * db.js
 * 
 * @example
 * const DB = require('./db.js')
 * const db = new DB([filename])
 */

const FS = require('fs')
const CRYPTO = require('./crypto.js')
const crypto = new CRYPTO()

class QUERY {
    static filter(data, s, caseInsensitive) {
        const arr = s.split('@@')
        let temp = []
        temp = JSON.parse(JSON.stringify(data))
        for (const cond of arr) {
            const qq = cond.split('^')
            const f = new Function('i', `return i.${qq[0]}&&i.${qq[0]}.match(/^${qq[1]}/${caseInsensitive ? 'i' : ''})`)
            temp = temp.filter(f)
        }
        return temp
    }
}

class SCHEMA {
    static validate(arr) {
        for (let rec of arr) {
            if (!rec.method(/POST|PUT|DELETE/))
                return 'Invalid method'
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
}

class DB {

    dbversion = 'v0.0.1'
    filename = ''
    DATA = []
    current = ''
    tokens = {}
    schema = {}
    txFunctions = [SCHEMA.validate]
    bsFunctions = []

    constructor(filename = './data.txt') {
        this.filename = filename
        if (!FS.existsSync(filename)) {
            FS.writeFileSync(filename, `edb ${this.dbversion}`)
            console.log(`edb public key is ${crypto.public}`)
            console.log(`edb public key (compressed) is ${crypto.public_compressed}`)
            console.log(`edb private key is ${crypto.private}`)
            this.transaction([
                { _method: 'POST', _type: '_schema', name: '_identity', field: ['name', 'public'] },
                { _method: 'POST', _type: '_schema', name: '_role', field: ['name'] },
                { _method: 'POST', _type: '_schema', name: '_identityrole', field: ['identity', 'role'] },
                { _method: 'POST', _type: '_schema', name: '_grant', field: ['role', 'permission'] },
                { _method: 'POST', _type: '_identity', name: 'edbroot', public: crypto.public_compressed },
                { _method: 'POST', _type: '_role', name: 'edbrole' },
                { _method: 'POST', _type: '_identityrole', identity: 'edbroot', role: 'edbrole' },
                { _method: 'POST', _type: '_grant', role: 'edbrole', field: 'id^.*$' }
            ])
        }
        return this
    }

    async build(version) {
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

    useTxFunction(f) {
        const func = (tx) => {
            return f(tx)
        }
        this.txFunctions.push(func)
    }

    useBsFunction(f) {
        const func = (tx) => {
            return f(tx)
        }
        this.bsFunctions.push(func)
    }

    transaction(arr) {
        if (typeof arr === 'string')
            arr = JSON.parse(arr)

        this.txFunctions.some((f) => f(arr))

        let ret = []
        for (let rec of arr) {
            const hash = crypto.hash(JSON.stringify(rec)).slice(32).toUpperCase()
            const id = hash.substring(0, 6)
            let obj = {}
            obj._id = (rec._method == 'POST') ? `${rec._type}.${id}` : rec._id
            delete rec._type
            delete rec._method
            Object.assign(obj, rec)
            ret.push(obj)
            const txLine = `${new Date().toISOString()}\t${type}\t${JSON.stringify(obj)}\t${hash}`
            FS.appendFileSync(this.filename, `\r\n${txLine}`)
        }

        this.buildStep (obj)
        this.bsFunctions.some((f) => f(arr))
        return ret
    }

    buildStep(obj) {
        if (obj._method === 'POST')
            return this.DATA.push(obj)
        if (obj._method === 'PUT') {
            return this.DATA = this.DATA.map(i =>
                obj._id === i._id ? { ...obj, completed: true } : obj
            )
        }
        if (obj._method === 'DELETE')
            return this.DATA = this.DATA.filter(i => i._id !== obj._id)

        if (obj._id.match(/^schema/)) {
            if (type.match(/POST|PUT/))
                this.schema[obj.name] = obj.fields
            if (type === 'DELETE')
                delete this.schema[obj.name]
        }
    }

    query (str) {
        return QUERY.filter(str)
    }

}

class DBSERVER {

    listen(port = 444) {
        const DB_SERVER = require('https_server.js')
        const db_server = new DB_SERVER()
        db_server.use(this.token)
        db_server.use(this.logout)
        db_server.use(this.query)
        db_server.use(this.api)
        db_server.use(this.events)
        return db_server.listen(port)
    }

    http_logout(r, s) {
        if (r.url !== '/logout')
            return false
        const token = r.headers.authorization.split('BEARER ')[1]
        delete this.tokens[token]
    }

    http_token(r, s) {
        const b64 = r.headers.authorization.split(' ')[1]
        const creds = Buffer.from(b64, 'base64').toString('ascii')
        const [user, pass] = creds.split(':')
        const passhashed = crypto.hash(crypto.hash(pass))
        const q = this.query(`_id^_identity\.&&pass_hash^${passhashed}$`)
        if (!q || !q[1])
            return false
        const token = crypto.hash(+new Date() + Math.random())
        this.tokens[token] = q[1]
        return s.end(`[{"token": "${token}"}]`)
    }

    http_query(r, s) {
        const mat = r.url.match(/\/q\/<?query>(.*)/)
        if (!mat.groups.query || r.method !== 'GET')
            return false
        const ret = this.query(mat.groups.query)
        return s.end(JSON.stringify(ret))
    }

    http_api(r, s) {
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

    http_events(r, s) {
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
    const d = new DB()

    // Build
    await db.build()
    console.log(`db is located at ${db.filename} and has ${db.DATA.length} records`)
    console.log(JSON.stringify(db.DATA, null, 2))

    // Tx func chain
    db.useTxFunction(db.txValidateSchema)
    db.useTxFunction(db.txWriteFile)

    // Bs func chain
    db.useBsFunction(db.buildData)

    // Transaction types
    //const id = db.transaction('POST', [{ _type: 'fruit', name: 'apples' }])[0]._id
    //const txPut = db.transaction('PUT', [{ _id: id, color: 'red' }])
    //const idd = db.transaction('POST', [{ _type: 'fruit', name: 'orange' }])[0]._id
    //const txDelete = db.transaction('DELETE', [{ _id: idd }])

    // Invalid Transaction Types

    // New user

    // Grant to new user

    // Schema

    // Query
    //console.log(db.DATA)
    //const qr = db.querystr('_id^frui@@color^red$')
    //console.log(qr)

    // Server
    //db.listen()

    // Get Token Success

    // Get Token Fail

    // Server query

    // Server transaction types

    // Server events

    // Server query with version

    // Logout

}
