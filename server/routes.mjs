import Util from './util.mjs'
import fs from 'node:fs'

export default {
    _debug: (r, s, data) => {
        console.log(`Method: ${r.method}`, `URL: ${r.url}`, `Data: ${JSON.stringify(data, null, 2)}`)
    },
    _user: (r, s, data, server) => {
        r.user = Util.authJWT(r) || ''
    },

    '/': (r, s, data, server) => s.end(fs.readFileSync('index.html', 'utf8')),
    '/enigmatic.js': (r, s, data, server) => s.end(fs.readFileSync(`./enigmatic.js`, 'utf8')),
    '/enigmatic.css': (r, s, data, server) => s.end(fs.readFileSync('./enigmatic.css', 'utf8')),
    '/sw.js': (r, s, data, server) => s.end(fs.readFileSync('./sw.js', 'utf8')),
    '/components.mjs': (r, s, data, server) => s.end(fs.readFileSync('./components.mjs', 'utf8')),

    '/events': (r, s) => {
        s.writeHead(200, { 'Content-Type': 'text/event-stream' })
        setInterval(() => {
            s.write(`data: ${JSON.stringify(Util.stats())}\n\n`)
        }, 1000)
    },
    '/api': {
        get(r, s, data, server) {
            s.end(db.query())
        },
        post(r, s, data, server) {
            if (this.has(`${o.type}:${o.name}`))
                s.writeHead(400).end('already exists')
            this.set(data)
            s.writeHead(201).end(JSON.stringify(data))
        },
        delete(r, s, data, server) {
            if (!this.has(`${o.type}:${o.name}`))
                s.writeHead(400).end('does not exist')
            this.set(data)
            s.writeHead(200).end(JSON.stringify(data))
        }
    },
    '/token': (r, s) => {
        const [user, pass] = Util.parseHttpBasic(r)
        if (!user || !pass)
            return s.writeHead(401).end()
        const hashed = hash(hash(pass))
        if (hashed !== r.server.db[`user:${user}`].pass)
            return s.writeHead(401).end()
        r.user = user
    }
}
