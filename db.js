/*

.init(version)

DB.DATA = [{_id:'sdkjshdkjasd', _type:'tablename'}, {_id:'asdaaaasdadd', _type:'tablename'}]
GET /api/i._type=="person"
POST /api   [{_type:'tablename'}, {_type:'tablename'}]
PUT /api    [{_id:'sdkjshdkjasd', _type:'tablename'}, {_id:'sdkjshdkjasd', _type:'tablename'}]
DELETE /api [{_id:'sdkjshdkjasd'}, {_id:'widhgahsgdjasd']

*/

const DB = {

    init: async (version) => {

        if (!require('fs').existsSync('./data.txt')) {
            const keys = require('./crypto.js').createKeys()
            require('fs').writeFileSync('./data.txt', `edb version 0.0.1`)
            console.log(`edb public key is ${keys.public_compressed}`)
            console.log(`edb private key is ${keys.private}`)
            DB.transaction('POST', `[{"_type": "_identity", "name": "edbroot", "public": "${keys.public_compressed}"}]`);
        }

        const rl = require('readline').createInterface({
            input: require('fs').createReadStream('./data.txt'),
            crlfDelay: Infinity
        })

        for await (const line of rl) {
            let [time, type, obj] = line.split('\t')
            if(!obj)
              continue
            if (!version || (new Date(time) <= new Date(version)))
              DB.readLine(time, type, JSON.parse(obj))
        }

        console.log(JSON.stringify(DB.DATA, null, 2))
        const ff = DB.query('i._type=="person"')
        console.log(ff)

    },

    query: (s) => {
        return DB.DATA.filter(new Function('i', `return ${s}`))
    },

    transaction: (type, arr) => {

        let ret = []

        for (rec of JSON.parse(arr)) {
            ret.push(DB.readLine(+new Date(), type, rec))
            require('fs').appendFileSync('./data.txt', `\r\n${new Date().toISOString()}\t${type}\t${JSON.stringify(rec)}`)
        }

        return ret

    },

    readLine: (time, type, obj) => {

        //for (const obj of arr) {

            if (type == 'POST') {
                DB.DATA.push(obj)
            } else if (type == 'PUT') {
                for (var i = 0; i < DB.DATA.length; i++) {
                    if (DB.DATA[i]._id == obj._id) {
                        DB.DATA[i] = obj
                    }
                }
            } else if (type == 'DELETE') {
                DB.DATA = DB.DATA.filter(i => i._id != obj._id)
            }

        //}

    },

    DATA: []

}

module.exports = DB