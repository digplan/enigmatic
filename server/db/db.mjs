import fs from 'node:fs'
import Types from './types.mjs'
import util from '../util.mjs'
import views from './views.mjs'

class vast extends Map {
    filename = ''
    constructor(filename = './db.json') {
        super()
        this.filename = filename
        if(!fs.existsSync(filename))
            this.set({'type':'vastdb', 'name':filename}) && this.save(filename)
        else
            util.readMap(this.filename, this)
    }
    getView(name, param) {
        const filter = views[name](param)
        return this.query(filter)
    }
    // All records  .query(), All tables  .query(([k, v]) => k.match(/^users:/))
    query(q = () => false) {
        return [...this].filter(q)
    }
    set(arr) {
        if(!arr.push) arr = [arr]
        arr.map(o => {
            const c = new Types[o.type]()
            c.validate(o)
            super.set(o.id, o)
        })
    }
    save() {
        fs.writeFileSync(filename, [...this.entries()])
    }
}
export { vast }

