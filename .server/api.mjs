import { Route } from 'https-microservice'
import { Supramap } from 'supramap'

if (!r.server.db)
    r.server.db = new Supramap('./db/db.json')
const db = r.server.db

export default class extends Route {

    get(r, s) {
        return db[funcname] ? db[funcname](r, s, data) : s.end(db.get[key])
    }
    
    patch(r, s, data) {
        let op = await r.json()
        op.id = op.type + ':' + op.name
        db[op.id] = op
        return s.writeHead(201).end()
    }

    post(r, s, data) {
        let op = await r.json()
        op.id = op.type + ':' + op.name
        db[op.id] = op
        return s.writeHead(201).end()
    }

    delete(r, s) {
        let od = await r.json()
        delete db[od.id]
        return s.writeHead(200).end()
    }

}
