import fs from 'node:fs'
import Types from './types.mjs'
import util from '../util.mjs'

class vast extends Map {

    constructor(filename = './db.json') {
        super()
        if(!fs.existsSync(filename))
            this.set({'type':'vastdb', 'name':filename}) && this.save(filename)
    }

    query(q) {
        const arr = []
        for (const [_, v] of this) {
            if (q(v))
                arr.push(v)
        }
        return arr
    }

    set(o) {
        if (!Array.isArray(o))
            o = [o]
        o = o.map(item => {
            console.log(item)
            const fc = `****8 ${JSON.stringify(Types)}`;
            const newrec = eval(fc)
            newrec.validate(item)
            if (this.has(newrec.id))
                newrec._created = this.get(newrec.id)._created
            return newrec
        })
        for (const rec of o) {
            super.set(rec.id, rec)
        }
    }

    json() {
        const ret = {}
        for (const [k, v] of this) {
            ret[k] = v
        }
        return JSON.stringify(ret, null, 2)
    }

    save(filename) {
        util.writeJson(filename, this.json())
    }

    load(filename) {
        const data = util.readJSON(filename)
        for (let rec in data) {
            super.set(rec, data[rec])
        }
        return { filename: fp, records: this.size }
    }

}

export { vast }

