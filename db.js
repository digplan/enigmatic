/*
  db.js
  
  Include:
  const DB = require('./db.js')
  const db = new DB(filename, version)

  Tests:
  > node db.js

*/

const FS = require('fs')

class DB {

    DATA = []

    constructor (filename) {
        if (FS.existsSync(fn))
            return this

        const keys = require('./crypto.js').createKeys()
        FS.writeFileSync(fn, `edb 0.0.1`)
        console.log(`edb public key is ${mDB.public = keys.public_compressed}`)
        console.log(`edb private key is ${keys.private}`)
        this.transaction('POST', `[{"_type": "_identity", "name": "edbroot", "public": "${keys.public_compressed}"}]`)
    }

    async init () {
        const rl = require('readline').createInterface({
            input: require('fs').createReadStream(fn),
            crlfDelay: Infinity
        })

        for await (const line of rl) {
            let [time, type, obj] = line.split('\t')
            if (obj && (!version || (new Date(time) <= new Date(version))))
                this.readLine(time, type, JSON.parse(obj))
        }
    }

    query (s) {
        return { query: s, results: mDB.DATA.filter(s) }
    }

    transaction (type, arr) {
        if (typeof arr == 'string')
            arr = JSON.parse(arr)

        let ret = []

        for (rec of arr) {
            ret.push(exports.readLine(+new Date(), type, rec))
            FS.appendFileSync(mDB.filename, `\r\n${new Date().toISOString()}\t${type}\t${JSON.stringify(rec)}`)
        }

        return ret
    }

    readLine (time, type, obj) {
        if (type == 'POST') {
            mDB.DATA.push(obj)
        } else if (type == 'PUT') {
            for (var i = 0; i < DB.DATA.length; i++) {
                if (mDB.DATA[i]._id == obj._id) {
                    mDB.DATA[i] = obj
                }
            }
        } else if (type == 'DELETE') {
            mDB.DATA = mDB.DATA.filter(i => i._id != obj._id)
        }
    }

    getToken (idIdentity) {

    }

    newIdentity () { }

    newRole () { }

    newIdentityRole () {}

    grant (idFrom, idTo, definition) {

    }
}

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
    console.log(`db is located at ${DB.filename} and has ${DB.DATA.length} records`)

    const newid = db.newIdentity('chris')
    const newrole = db.newRole('users')
    const newidrole = db.newIdentityRole('chris', 'users')
    const grant = db.grant('users', '_type=="users"')
    const id = db.transaction('POST', {_type:'fruit', name:'apples'})ß
    const txPut = db.transaction('PUT', {_id: id, color: 'red'})
    const idd = db.transaction('POST', {_type:'fruit', name:'orange'})
    const txDelete = db.transaction('DELETE', {_id: idd})
    const root = db.query(new Function('i', 'return i._type=="fruit"'))
    
}
