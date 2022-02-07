export default class BaseType {
    id = ''
    name = ''
    _created = new Date().toISOString()
    _updated = new Date().toISOString()
    validate(obj) {
        const mytype = this.constructor.name
        for (let field in this) {
            if (field[0] != '_' && !obj.hasOwnProperty(field) && !this[field])
                throw Error(`must include field: ${field}, input was ${JSON.stringify(obj)}`)
        }
        for (let k in obj) {
            if (!this.hasOwnProperty(k) && !k.match(/name|_type/))
                throw Error(`field ${k} not on type ${mytype}`)
            this[k] = obj[k]
        }
        this.id = `${mytype}:${obj.name}`
    }
    json() {
        return JSON.stringify(this, null, 2)
    }
}