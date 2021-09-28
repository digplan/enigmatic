/*

DB.DATA = {"tablename": [{_id:'sdkjshdkjasd', _type:'tablename'}, {_id:'asdaaaasdadd', _type:'tablename'}], }
GET /api/tablename
POST /api   [{_type:'tablename'}, {_type:'tablename'}]
PUT /api    [{_id:'sdkjshdkjasd', _type:'tablename'}, {_id:'sdkjshdkjasd', _type:'tablename'}]
DELETE /api [{_id:'sdkjshdkjasd'}, {_id:'widhgahsgdjasd']

*/

const FS = require('fs')
const READLINE = require('readline')

module.exports = DB = {

    init: () => {

        if (!FS.existsSync('./data.txt'))
            FS.writeFileSync('./data.txt', `edb ${new Date().toISOString()}`)
        DB.build()

    },

    build: async () => {

        const rl = READLINE.createInterface({
            input: FS.createReadStream('./data.txt'),
            crlfDelay: Infinity
        })

        for await (const line of rl) {
            let [time, type, obj] = line.split('\t')
            if (obj)
                DB.processLine(type, JSON.parse(obj))
        }

    },

    transaction: (type, obj, table) => {

        if (type == 'GET')
          return DB.DATA[table]

        let ret = []

        for(rec of JSON.parse(obj)) {
        
          if (type == 'POST')
            rec._id = +new Date()

          ret.push(DB.processLine(type, rec, table))
          FS.appendFileSync('./data.txt', `\r\n${new Date().toISOString()}\t${type}\t${JSON.stringify(rec)}`)
        
        }

        return ret

    },

    processLine: (type, arr, table) => {

        let ret = []

        for (const obj of arr) {

            if (type == 'POST') {
                obj._id = +new Date()
                DB.DATA[table].push(obj)
                ret.push(obj)
            }
            if (type == 'PUT') {
                DB.DATA[obj._id] = obj
                ret.push(DB.DATA[obj._id])
            }
            if (type == 'DELETE') {
                delete DB.DATA[obj._id]
                ret.push(obj)
            }

        }

        return ret

    },

    DATA: {}

}