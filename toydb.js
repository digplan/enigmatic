const CRYPTO = require('./crypto.js')
const HTTPS_SERVER = require('./https_server.js')
const FS = require('fs')

class TOY_DB extends HTTPS_SERVER {

    DATA = []

    constructor () {
        super ()
        this.filelocation = './data/toydb.json'
        this.dbinstance = quickId()
        this.functions = [this.app]
        this.load()
        this.listen(444)
    }

    app(r, s) {
        const [blank, method, data] = r.url.split('/')
        const o = require('query-string').parse(data)

        switch (method) {
            case '_post':
                const h = hash(+new Date() + '').toUpperCase().substr(0, 6)
                o._id = `${dbinstance}.${o._type}.${h}`
                o._created = o._updated = new Date().toISOString()
                delete o._type
                this.DATA.push(o)
                this.persist()
                s.end(JSON.stringify(o))
                break;
            case '_put':
                this.persist()
                s.end(JSON.stringify(o))
                break;
            case '_get':
                const res = this.query()
                s.end(JSON.stringify(o))
                break;
            case '_delete':
                this.persist()
                s.end(JSON.stringify(o))
            default:
                s.writeHead(404).end()
        }
    }

    query () {
        return this.DATA
    }

    load () {
        return this.DATA = JSON.parse(readFileSync(this.filelocation))
    }

    persist () {
        return writeFileSync(this.filelocation, JSON.stringify(this.DATA, null, 2))
    }

}