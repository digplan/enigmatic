/*
  db.js
  
  Include:
  const DB = require('./db.js')
  const db = new DB(filename, version)

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
    txEvent = ()=>{}
    lastline = ''
    tokens = {}

    constructor (filename = './data.txt') {
        this.filename = filename
        if (!FS.existsSync(filename)) {
            FS.writeFileSync(filename, `edb ${this.dbversion}`)
            console.log(`edb public key is ${crypto.public}`)
            console.log(`edb public key (compressed) is ${crypto.public_compressed}`)
            console.log(`edb private key is ${crypto.private}`)
            this.newIdentity('edbroot')
            this.newRole('edbroot')
            this.newIdentityRole('edbroot', 'edbroot')
            this.grant('edbroot', '_id^.$')
        }
        return this
    }

    async init (version) {
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

    query (s) {
        const qq = s.split('^')
        const f = new Function('i', `return i.${qq[0]}&&i.${qq[0]}.match(/^${qq[1]}/)`)
        return this.DATA.filter(f)
    }

    querystr (s) {
        const def = s.split('@@')
        let temp = JSON.parse(JSON.stringify(this.DATA));
        for(const cond of def) {
            temp = this.query(cond)
        }
        return temp
    }

    transaction (type, arr) {
        if (typeof arr == 'string')
            arr = JSON.parse(arr)

        let ret = []

        for (let rec of arr) {
            const hash = crypto.hash(this.lastline + JSON.stringify(rec)).slice(32).toUpperCase()
            const id = hash.substring(0, 6)

            let obj = {}
            obj._id = (type == 'POST') ? `${rec._type}.${id}` : rec._id
            delete rec._type

            for(let i in rec)
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

    buildStep (type, obj) {
        if (type === 'POST') {
            this.DATA.push(obj)
        } else if (type === 'PUT') {
            for (var i = 0; i < this.DATA.length; i++) {
                if (this.DATA[i]._id == obj._id) {
                    this.DATA[i] = obj
                }
            }
        } else if (type === 'DELETE') {
            this.DATA = this.DATA.filter(i => i._id != obj._id)
        }
    }

    getToken (username, pass) {
        pass = crypto.hash(pass)
        const finduser = this.query(`name^${username}|pass^${pass}`)
        if (!finduser[0])
          return false
        const token = crypto.hash(Math.random())
        for(idrole in this.query('identityrole', ))
          
        return token
    }

    newIdentity (name, pass) {
        let obj = { _type: '_identity', name: name }
        if(pass)
            obj.pass = crypto.hash(pass)
        this.transaction('POST', [obj])
    }

    newRole (name) {
        this.transaction('POST', [{ _type: '_role', name: name }])
    }

    newIdentityRole (identity, role) {
        this.transaction('POST', [{ _type: '_identityrole', identity: identity, role: role }])
    }

    grant (from, to, definition) {
        this.transaction('POST', [{ _type: '_grant', from: from, to: to, definition: definition }])
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

    if (FS.existsSync(`./TESTING-eDB.txt`))
        FS.unlinkSync(`./TESTING-eDB.txt`)

    const DB = require('./db.js')
    const db = new DB(`./TESTING-eDB.txt`)
    await db.init()
    console.log(`db is located at ${db.filename} and has ${db.DATA.length} records`)
    console.log(JSON.stringify(db.DATA, null, 2))

    const newid = db.newIdentity('chris')
    const newrole = db.newRole('users')
    const newidrole = db.newIdentityRole('chris', 'users')
    const grant = db.grant('edbroot', 'users', '_id^fruit\.')
    const id = db.transaction('POST', [{ _type: 'fruit', name: 'apples' }])[0]._id
    const txPut = db.transaction('PUT', [{ _id: id, color: 'red' }])
    const idd = db.transaction('POST', [{ _type: 'fruit', name: 'orange' }])[0]._id
    const txDelete = db.transaction('DELETE', [{ _id: idd }])

    console.log(db.DATA)
    const qr = db.querystr('_id^frui@@color^red$')
    console.log(qr)

}
