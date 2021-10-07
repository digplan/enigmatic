/*
  db.js
  
  Include:
  const DB = require('./db.js')

  Tests:
  > node db.js

*/

const FS = require('fs')
let mDB = { DATA: [] }

exports.dbinit = async (fn = './data.txt', version) => {

    mDB.filename = fn

    if (!FS.existsSync(fn)) {
        const keys = require('./crypto.js').createKeys()
        require('fs').writeFileSync(fn, `edb 0.0.1`)
        console.log(`edb public key is ${mDB.public = keys.public_compressed}`)
        console.log(`edb private key is ${keys.private}`)
        exports.transaction('POST', `[{"_type": "_identity", "name": "edbroot", "public": "${keys.public_compressed}"}]`);
    }

    const rl = require('readline').createInterface({
        input: require('fs').createReadStream(fn),
        crlfDelay: Infinity
    })

    for await (const line of rl) {
        let [time, type, obj] = line.split('\t')
        if (obj && (!version || (new Date(time) <= new Date(version))))
            exports.readLine(time, type, JSON.parse(obj))
    }

    return mDB

}

exports.query = (s) => {
    return { query: s, results: mDB.DATA.filter(s) }
}

exports.transaction = (type, arr) => {
    if (typeof arr == 'string')
        arr = JSON.parse(arr)

    let ret = []

    for (rec of arr) {
        ret.push(exports.readLine(+new Date(), type, rec))
        FS.appendFileSync(mDB.filename, `\r\n${new Date().toISOString()}\t${type}\t${JSON.stringify(rec)}`)
    }

    return ret
}

exports.readLine = (time, type, obj) => {
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

exports.getToken = (idIdentity) => {

}

exports.newIdentity = () => { }

exports.newRole = () => { }

exports.grant = (idFrom, idTo, definition) => {

}

/*****************
       Tests  
******************/

if (require.main !== module)
    return

test()

async function test() {
    console.log('*** Testing db.js')

    const { dbinit, query, transaction, getToken, newIdentity, newRole, grant } = require('./db.js')

    const filename = `./TESTING-eDB.txt`;
    if (FS.existsSync(filename))
        FS.unlinkSync(filename)

    const DB = await dbinit(filename)
    console.log(DB)
    console.log(`db is located at ${DB.filename} and has ${DB.DATA.length} records`)
    const root = query(new Function('i', 'return i._type=="_identity" && i.name=="edbroot"'))
    console.log(root)
}
