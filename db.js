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

class DBSERVER extends HTTPS_SERVER {

    DB

    constructor(filename) {
        super()
        this.DB = new DB(filename)
    }

    async dblisten() {
        await DB.build()
        this.functions = [this.http_api, this.http_logout, this.http_query, this.http_token, this.NOTFOUND]
        this.listen()
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
        const [user, pass] = creds?.split(':')
        if (!user || !pass)
            return false
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

    // Tx func chain
    //db.useTxFunction(db.txValidateSchema)
    //db.useTxFunction(db.txWriteFile)

    // Bs func chain
    //db.useBsFunction(db.buildData)

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
