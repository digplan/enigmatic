import fs from 'node:fs'
import Types from './types.mjs'

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
            const newrec = eval(`new ${Types[item.type]}()`)
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
        const fp = new URL(filename, import.meta.url).pathname.slice(1)
        fs.writeFileSync(fp, this.json())
        return { filename: fp, records: this.size }
    }

    load(filename) {
        const fp = new URL(filename, import.meta.url).pathname.slice(1)
        const data = JSON.parse(fs.readFileSync(fp))
        for (let rec in data) {
            super.set(rec, data[rec])
        }
        return { filename: fp, records: this.size }
    }

}

export { vast }

