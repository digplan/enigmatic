import {existsSync, readFileSync, writeFileSync} from 'node:fs'

const path = './db.json'
const defaultDB = { 'user:admin': { pass: 'admin' } }

export default (r, s, data) => {
    if(r.server.db) return false
    if(existsSync(path)) {
        r.server.db = JSON.parse(readFileSync(path, 'utf8'))
    } else {
        r.server.db = defaultDB
        writeFileSync(path, JSON.stringify(r.server.db, null, 2))
    }
    return false
}