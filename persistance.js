const { appendFile } = require('fs')
const { createHash } = require('crypto')

class Persist_Deta {
    hash = ''
    db = ''
    constructor(key, dbname) {
        const { Deta } = require('deta')
        this.deta = Deta(key)
        this.selectDB(dbname)
        this.hash = this.get('_hash')
    }
    selectDB(dbname) {
        this.db = this.deta.Base(dbname)
    }
    async query(q) {
        const f = await this.db.fetch(q)
        return JSON.stringify(f.items)
    }
    async get(k) {
        return await this.db.get(k)
    }
    tx(o) {
        try {
            if (o._method == 'D')
                this.db.delete(o._id)
            else if (o._method == 'U')
                this.db.update(o, o._id)
            else if (o._method == 'C')
                this.db.insert(o, o._id)
            else
                throw Error('invalid method')
            this.hash = createHash('sha256').update(this.hash + JSON.stringify(o)).digest('hex')
            return [o, this.hash]
        } catch (e) {
            return null
        }
    }
}

class Persist_Simple {
    hash = ''
    db = null
    constructor(key, dbname) {
        this.db = this[dbname] = {}
    }
    selectDB(dbname) {
        this.db = this[dbname]
    }
    async query(q) {
        return JSON.stringify(this.db, null, 2)
    }
    async get(k) {
        return this.db[k]
    }
    tx(o) {
        try {
            const hash = createHash('sha256').update(this.hash + JSON.stringify(o)).digest('hex')
            appendFile(this.db, [+new Date(), hash, JSON.stringify(o)].join('\t') + '\r\n')
            return [o, hash]
        } catch (e) {
            return null
        }
    }
}

class Persist_File {
    hash = ''
    db = null
    constructor(key, dbname) {
        this.db = dbname
    }
    async query(q) {
        return JSON.stringify(this.db, null, 2)
    }
    tx(o) {
        try {
            if (o._method == 'D')
                delete this.db[o._id]
            else if (o._method == 'U')
                this.db[o._id] = o
            else if (o._method == 'C')
                this.db[o._id] = o
            else
                throw Error('invalid method')
            this.hash = createHash('sha256').update(this.hash + JSON.stringify(o)).digest('hex')
            return [o, this.hash]
        } catch (e) {
            return null
        }
    }
}

(async () => {
    const p = new Persist_Deta('b0afoczh_4uhq5KB4G6QBVLG3Cj42cWZZbaAJMgaT', 'test')
    let [o, hash] = p.tx({ _method: 'C', _id: 'tcdlfeexuxcb' })
    console.log(o, hash)
    console.log(await p.query())
})()
