#!/usr/bin / env node
import fs from 'node:fs'
import { Server } from 'node:https'
import routes from './routes.mjs'

let dir = process.cwd()
let dir_key = `${dir}/../keys/key.pem`
let dir_cert = `${dir}/../keys/cert.pem`

class HTTPSServer extends Server {
    constructor() {
        super({ key: fs.readFileSync(dir_key), cert: fs.readFileSync(dir_cert) })
        this.on('request', this.handler)
    }
    handler(r, s) {
        try {
            if (this.debug) console.log(`${r.method} ${r.url}`)
            let data = ''
            r.on('data', (s) => data += s.toString())
            r.on('end', () => {
                s.endJSON = (obj) => s.end(JSON.stringify(obj))
                try { data = JSON.parse(data) } catch (e) { }
                for (const middleware of Object.keys(routes).filter(n => n.match(/^_/))) {
                    middleware(r, s, data, this)
                }
                return routes[r.url] ? routes[r.url](r, s, data, server) : s.writeHead(404).end()
            })
        } catch (e) {
            console.log(e)
            s.writeHead(500).end()
        }
    }
}

import { vast } from './db/db.mjs'
const server = new HTTPSServer()
server.db = new vast()
server.listen(3000)