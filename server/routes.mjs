import Util from './util.mjs'

//const { JWT } = import('jwt-tiny')
//const jwt = new JWT('your-256-bit-secret')

export default {

    _debug: (r, s, data) => {
        console.log(`Headers: ${JSON.stringify(r.headers, null, 2)}`, `Method: ${r.method}`, `URL: ${r.url}`, `Data: ${JSON.stringify(data, null, 2)}`)
    },

    _user: (r, s, data, server, db) => {
        if (!r.headers.Authorization) return
        const jwt = jwt.verify(r.headers.Authorization.split(' ')[1])
        console.log(jwt);  //if(jwt.name) r.user = jwt.name
    },

    stats: (r, s) => {
        return s.endJSON(util.stats())
    },

    api: class {
        get(r, s, data, server, db) {
            s.end(db.query())
        }
        put(r, s, data, server, db) {
        }
        post(r, s, data, server, db) {
            if(this.has(`${o.type}:${o.name}`))
                s.writeHead(400).end('already exists')
            this.set(data)
            s.writeHead(201).end(JSON.stringify(data))
        }
        delete(r, s, data, server, db) {
            if(!this.has(`${o.type}:${o.name}`))
                s.writeHead(400).end('does not exist')
            this.set(data)
            s.writeHead(200).end(JSON.stringify(data))
        }
    },

    token: (r, s) => {
        const { authorization, cookie } = r.headers
        if (authorization) {
            const [type, userpass] = authorization.split(' ')
            const [user, pass] = Buffer.from(userpass, 'base64').toString('ascii').split(':')
            const hashed = hash(hash(pass))
            if (hashed !== r.server.db[`user:${user}`].pass) return
            r.user = user
        }
        return s.writeHead(401).end()
    }

}
