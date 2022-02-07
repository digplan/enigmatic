import BaseType from './basetype.mjs'

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