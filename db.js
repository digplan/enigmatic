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

    filename = ''
    DATA = []
    txEvent = ()=>{}
    lastline = ''

    constructor(filename = './data.txt') {
        this.filename = filename
        if (!FS.existsSync(filename)) {
            FS.writeFileSync(filename, `edb 0.0.1`)
            console.log(`edb public key is ${crypto.public_compressed}`)
            console.log(`edb private key is ${crypto.private}`)
            this.transaction('POST', `[{"_type": "_identity", "name": "edbroot", "public": "${crypto.public_compressed}"}]`)
        }
        return this
    }

    async init(version) {
        const rl = require('readline').createInterface({
            input: FS.createReadStream(this.filename),
            crlfDelay: Infinity
        })

        for await (const line of rl) {
            let [time, type, obj] = line.split('\t')
            if (obj && (!version || (new Date(time) <= new Date(version))))
                this.readLine(time, type, JSON.parse(obj))
        }
    }

    query(s) {
        return { query: s, results: this.DATA.filter(s) }
    }

    transaction(type, arr) {
        if (typeof arr == 'string')
            arr = JSON.parse(arr)

        let ret = []

        for (let rec of arr) {
            const hash = crypto.hash(this.lastline + JSON.stringify(rec)).slice(32).toUpperCase()
            const id = hash.substring(0, 6)

            let obj = {}
            if(type == 'POST') 
              obj._id = `${rec._type}.${id}`
            delete rec._type

            obj._hash = hash
            for(let i in rec)
              obj[i] = rec[i]
            ret.push(obj)

            const txLine = `${new Date().toISOString()}\t${type}\t${JSON.stringify(obj)}`
            FS.appendFileSync(this.filename, `\r\n${txLine}`)
            this.txEvent(txLine)
            this.lastline = txLine
        }

        return ret
    }

    readLine(time, type, obj) {
        if (type == 'POST') {
            this.DATA.push(obj)
        } else if (type == 'PUT') {
            for (var i = 0; i < this.DATA.length; i++) {
                if (this.DATA[i]._id == obj._id) {
                    this.DATA[i] = obj
                }
            }
        } else if (type == 'DELETE') {
            this.DATA = this.DATA.filter(i => i._id != obj._id)
        }
    }

    getToken(idIdentity) {

    }

    newIdentity(name) {
        this.transaction('POST', [{ _type: '_identity', name: name }])
    }

    newRole(name) {
        this.transaction('POST', [{ _type: '_role', name: name }])
    }

    newIdentityRole(identity, role) {
        this.transaction('POST', [{ _type: '_identityrole', identity: identity, role: role }])
    }

    grant(from, to, definition) {
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

    const newid = db.newIdentity('chris')
    const newrole = db.newRole('users')
    const newidrole = db.newIdentityRole('chris', 'users')
    const grant = db.grant('users', '_type=="users"')
    const id = db.transaction('POST', [{ _type: 'fruit', name: 'apples' }])[0]._id
    const txPut = db.transaction('PUT', [{ _id: id, color: 'red' }])
    const idd = db.transaction('POST', [{ _type: 'fruit', name: 'orange' }])[0]._id
    const txDelete = db.transaction('DELETE', [{ _id: idd }])
    const root = db.query(new Function('i', 'return i._type=="fruit"'))

}
