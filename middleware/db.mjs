import {writeFileSync} from 'node:fs'

export default (r, s, data) => {
    if(r.server.db) return
    r.server.db = {}
    writeFileSync('./db.json', JSON.stringify(r.server.db, null, 2))
}