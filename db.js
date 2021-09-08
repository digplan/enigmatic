const FS = require('fs')
const READLINE = require('readline')

module.exports = DB = {
    init: ()=> {
        if(!FS.existsSync('./data.txt'))
          FS.writeFileSync('./data.txt', `edb ${new Date().toISOString()}`)
        DB.build()
    },
    build: async ()=> {
        const rl = READLINE.createInterface({
            input: FS.createReadStream('./data.txt'),
            crlfDelay: Infinity
        })
        for await (const line of rl) {
            let [time, type, obj] = line.split('\t')
            if(obj)
              DB.processLine(type, JSON.parse(obj))
        }
    },
    transaction: (type, obj)=> {
      if(type == 'GET')
        return DB.DATA
      if(obj) obj = JSON.parse(obj)
      const ret = DB.processLine(type, obj)
      FS.appendFileSync('./data.txt', `\r\n${new Date().toISOString()}\t${type}\t${JSON.stringify(obj)}`)
      return ret
    },
    processLine: (type, obj)=> {
      if(type == 'POST'){
        const id = +new Date()
        obj._id = id
        DB.DATA[id] = obj
        return DB.DATA[id]
      }
      if(type == 'PUT') {
        DB.DATA[obj._id] = obj
        return DB.DATA[obj._id]
      }
      if(type == 'DELETE'){
        delete DB.DATA[obj._id]
        return obj
      }
      return;
    },
    DATA: {}
}