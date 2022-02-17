export default {
    _debug: (r, s, data) => {

    },
    stats: (r, s, data) => {
        return ''
        // Potentially unsafe options (Development only)
        // Use http, not https
        // Do not encrypt data
        // Disable authentication

        // Databases
        // Public key / Id, Types, #Records, #Tx (last min, hour, day), Health, Online

    },
    api: (r, s, data) => {
        return ''
    }
}

import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const path = './db.json'
const defaultDB = { 'user:admin': { pass: 'admin' } }

export default (r, s, data) => {
    if (r.server.db) return false
    if (existsSync(path)) {
        r.server.db = JSON.parse(readFileSync(path, 'utf8'))
    } else {
        r.server.db = defaultDB
        writeFileSync(path, JSON.stringify(r.server.db, null, 2))
    }
    return false
}

export default (r, s, data) => {
    console.log(`Headers: ${JSON.stringify(r.headers, null, 2)}`, `Method: ${r.method}`, `URL: ${r.url}`, `Data: ${JSON.stringify(data, null, 2)}`)
}

const hash = (s) => {
    const buf = crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default (r, s, data) => {
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

const get_types = (db) => {
    return Object.keys(db).map(id => id.split(':')[0])
}

export { get_types }