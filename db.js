/*

DB.DATA = [{_id:'sdkjshdkjasd', _type:'tablename'}, {_id:'asdaaaasdadd', _type:'tablename'}]
GET /api/db/tablename
POST /api   [{_type:'tablename'}, {_type:'tablename'}]
PUT /api    [{_id:'sdkjshdkjasd', _type:'tablename'}, {_id:'sdkjshdkjasd', _type:'tablename'}]
DELETE /api [{_id:'sdkjshdkjasd'}, {_id:'widhgahsgdjasd']

*/

const DB = {

    init: () => {

        if (!require('fs').existsSync('./data.txt'))
            FS.writeFileSync('./data.txt', `edb ${new Date().toISOString()}`)
        DB.build()

    },

    build: async () => {

        const rl = require('readline').createInterface({
            input: require('fs').createReadStream('./data.txt'),
            crlfDelay: Infinity
        })

        for await (const line of rl) {
            let [time, type, obj] = line.split('\t')
            if (obj)
                DB.readLine(time, type, JSON.parse(obj))
        }

        console.log(JSON.stringify(DB.DATA, null, 2))

    },

    transaction: (type, obj, table) => {

        if (type == 'GET'){}
     
        let ret = []

        for (rec of JSON.parse(obj)) {
            ret.push(DB.readLine(+new Date(), type, rec))
            FS.appendFileSync('./data.txt', `\r\n${new Date().toISOString()}\t${type}\t${JSON.stringify(rec)}`)
        }

        return ret

    },

    readLine: (time, type, arr) => {

        for (const obj of arr) {

            if (type == 'POST')
                return DB.DATA.push(obj)

            if (type == 'PUT') {
                for( var i = 0; i < DB.DATA.length; i++){ 
                    console.log(i)
                    if ( DB.DATA[i]._id == obj._id) { 
                        DB.DATA[i] = obj
                    }
                }
            }

            if (type == 'DELETE')
                DB.DATA = DB.DATA.filter(i=>i._id==obj._id)

        }

    },

    DATA: []

}

module.exports = DB