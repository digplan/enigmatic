import fs from 'node:fs'
import BaseType from './basetype.mjs'
import Types from './types.mjs'

class Supramap extends Map {

    types = Types

    async loadFunctions() {
        let dirname = new URL(import.meta.url).pathname.split('/').slice(0, -1).join('/').slice(1)
        if (process.platform !== 'win32')
            dirname = '/' + dirname
        this.functions = {}
        for (const model of fs.readdirSync(dirname + '/functions')) {
            if (!model.endsWith('.mjs')) continue
            let furl = 'file://' + dirname + '/functions/' + model
            console.log('loading function: ' + furl)
            let f = await import(furl);
            this.functions[model.replace('.mjs', '')] = f.default;
        }
    }

    query(q) {
        const arr = []
        for (const [_, v] of this) {
            if(q(v))
                arr.push(v)
        }
        return arr
    }

    set(o) {
        if (!Array.isArray(o))
            o = [o]
        o = o.map(item => {
            const newrec = eval(`new ${this.types[item.id.split(':')[0]]}()`)
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

export { Supramap }