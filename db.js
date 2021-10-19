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
const HTTPS_SERVER = require('./https_server.js')

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

    constructor (filename = './data.txt') {
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

    async build (version) {
        this.DATA = []
        const rl = require('readline').createInterface({
            input: FS.createReadStream(this.filename),
            crlfDelay: Infinity
        })

        for await (const line of rl) {
            let [time, type, obj] = line.split('\t')
            if (obj && (!version || (new Date(time) <= new Date(version)))) {
                this.buildStep(obj)
            }
        }
    }

    getPermissionsForUser (user) {

    }
    
    preTransaction (arr) {

    }
    
    transaction (arr) {
        if (typeof arr === 'string') {
            arr = JSON.parse (arr)
        }

        for (let step of arr) {
            step._hash = crypto.hash(JSON.stringify(step)).slice(32).toUpperCase()
            if (step._method == 'POST') step._id = `${step._type}.${step._hash.substring(0, 6)}`
        }

        for (let step of arr) {
          this.buildStep (step)
        }

        let ret = []
        for (let rec of arr) {
            const txLine = `${new Date().toISOString()}\t${JSON.stringify(rec)}`
            FS.appendFileSync(this.filename, `\r\n${txLine}`)
            ret.push(rec)
        }
        return ret
    }

    preBuildStep (obj) {
        // validate schema, build schema?
    }

    buildStep (obj) {
            if (obj._method === 'POST')
                this.DATA.push(obj)
            if (obj._method === 'PUT') {
                return this.DATA = this.DATA.map(i =>
                    obj._id === i._id ? { ...obj, completed: true } : obj
                )
            }
            if (obj._method === 'DELETE')
                this.DATA = this.DATA.filter(i => i._id !== obj._id)
    }

    query (str) {
        return QUERY.filter(str)
    }

}

class DBSERVER extends HTTPS_SERVER {

    DB

    constructor (filename) {
        super()
        this.DB = new DB(filename)
    }

    async dblisten () {
        await DB.build()
        this.authorize = (user, pass) => {
            const passhashed = crypto.hash(crypto.hash(pass))
            const q = this.query(`_id^_identity\.&&pass_hash^${passhashed}$`)
            if (!q || !q[1])
                return false
            const token = crypto.hash(+new Date() + Math.random())
            return {token: token, user: user}
        }
        this.permissions = (user) => {
            return this.getPermissionsForUser (user)
        } 
        this.functions = [this.http_api, this.http_query, this.NOTFOUND]
        this.listen()
    }

    http_query (r, s) {
        if (r.url !== '/query' || r.method !== 'GET')
            return false
        const mat = r.url.match(/\/query\/<?query>(.*)/)
        if (!mat.groups.query)
            return false
        const ret = this.query (mat.groups.query)
        return s.end(JSON.stringify (ret))
    }

    http_api (r, s) {
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

    const dbserver = new DBSERVER(`./TESTING-eDB.txt`)
    dbserver.listen(444)
    const db = dbserver.DB

    // Build
    console.log(`db is located at ${db.filename} and has ${db.DATA.length} records`)
    console.log(JSON.stringify(db.DATA, null, 2))

    // Transaction types
    const post = db.transaction([{ _method: 'POST', _type: 'fruit', name: 'apple' }])
    console.log (post)
    const put = db.transaction([{ _id: post[0]._id, _method: 'PUT', _type: 'fruit', name: 'banana' }])
    console.log (put)
    const post2 = db.transaction([{ _method: 'POST', _type: 'fruit', name: 'mango' }])
    console.log (post2)
    const del = db.transaction([{ _id: put[0]._id}])
    console.log (del)

    // Query
    const qr = db.querystr ('_type^fruit$')
    console.log (qr)

    // Invalid Transaction Types
    const badt = db.transaction([{ _method: 'OPTIONS', _type: 'fruit', name: 'mango' }])
    console.log (badt)

    // Validate schema
    const teams = db.transaction([{ _method: 'POST', _type: '_schema', name: '_teams', field: ['name', 'mascot'] }])
    const ok = db.transaction([{ _method: 'POST', _type: '_teams', name: 'Phillies', mascot: 'Phanatic' }])
    console.log (ok)
    const notok = db.transaction([{ _method: 'POST', _type: '_teams', name: 'Pirates' }])
    console.log (notok)

    // New user role grant
    const user = db.transaction([{ _method: 'POST', _type: '_identity', name: 'testuser', pass: 'testpass' },
    { _method: 'POST', _type: '_role', name: 'myrole' },
    { _method: 'POST', _type: '_identityrole', identity: 'testuser', role: 'myrole' },
    { _method: 'POST', _type: '_grant', role: 'edbrole', field: '_type^fruit$' }])

    // Get Token Success
    const f = await fetch ('/token', headers: { Authorization: Buffer.from('testuser:testpass', 'base64') })
    const token = await f.toJSON()
    console.log (token)

    // Get Token Fail
    const bf = await fetch ('/token', headers: { Authorization: Buffer.from('testuser:badpass', 'base64') })
    const bj = await f.toJSON()
    console.log (bj)

    // Server query
    const q = await fetch ('/query/_type^.$', headers: { Authorization: `BEARER ${token[0].token}`) })
    const qj = await f.toJSON()
    console.log (qj)

    // Server query with version
    const q1 = await fetch ('/query/_type^.$', headers: { Authorization: `BEARER ${token[0].token}`) })
    const qj1 = await f.toJSON()
    console.log (qj1)

    // Server events
    const ev = new EventSource ('/events')
    let i = 0
    ev.onmessage ((ev) => {
        console.log(ev)
        if (i++ > 3)
          ev.close ()
    })
    
    // Logout
    const q2 = await fetch ('/logout', headers: { Authorization: `BEARER ${token[0].token}`) })
    const qj2 = await f.toJSON()
    console.log (qj2)
    const q3 = await fetch ('/query/_type^.$', headers: { Authorization: `BEARER ${token[0].token}`) })
    const qj3 = await f.toJSON()
    console.log (qj3)   
}
