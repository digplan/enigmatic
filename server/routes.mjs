import Util from './util.mjs'
const util = new Util()

export default {

    _debug: (r, s, data) => {
        console.log(`Headers: ${JSON.stringify(r.headers, null, 2)}`, `Method: ${r.method}`, `URL: ${r.url}`, `Data: ${JSON.stringify(data, null, 2)}`)
    },

    _db: (r, s, data) => {
        if (r.server.db) return false
        if (existsSync(path)) {
            r.server.db = JSON.parse(readFileSync(path, 'utf8'))
        } else {
            r.server.db = defaultDB
            writeFileSync(path, JSON.stringify(r.server.db, null, 2))
        }
    },

    stats: (r, s, data) => {
        return s.endJSON(util.stats())
    },

    api: (r, s, data) => {

    },

    token: () => {
        if (r.user) return
        const { authorization, cookie } = r.headers
        if (authorization) {
            const [type, userpass] = authorization.split(' ')
            const [user, pass] = Buffer.from(userpass, 'base64').toString('ascii').split(':')
            const hashed = hash(hash(pass))
            if (hashed !== r.server.db[`user:${user}`].pass) return
            r.user = user
        }
        return false
    }

}
