class BaseType {
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

class entity extends BaseType {
    // age = 40  // default value
    // Street // required value
}

class person extends entity {
    firstname
    middlename
    lastname
    nickname
    email
    phone
    picture
}

class employee extends person {
    employeenumber
    title
    department
    company
    hiredate
    termdate
    manager
    worktype
}

class group extends entity {
    name
    description
}

class groupmember extends BaseType {
    group
    member
}

class timezone extends BaseType {
    name
    abbr
    offset
}

class location extends entity {
    name
    address
    city
    state
    zip
    country
    lat
    lng
    timezone
}

class keypair {
    name
    public
    private
    type
}

class country {
    name
    abbr
    code
}

class language {
    name
}

export default {
    "entity": entity,
    "person": person,
    "employee": employee,
    "group": group,
    "groupmember": groupmember,
    "timezone": timezone,
    "location": location,
    "keypair": keypair,
    "country": country,
    "language": language
}