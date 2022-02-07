#!/usr/bin/env node
import { Supramap } from './supramap.mjs'
const m = new Supramap()

// functions
await m.loadFunctions()
console.log(m.functions.now())

// .types
console.log(m.types)

// .set(object)
m.set({ _type: 'Person', name: 'Chris', upd: 1 })

// .set(array)  // Transactional
m.set([{ _type: 'Person', name: 'Brandon', upd: 2, age: 19 }])

// Bad record in transaction
try {
    m.set([{ _type: 'Person', name: 'Joe', upd: 3, age: 21 }, { _type: 'Person', bad: 'transaction' }])
} catch(e) {
    console.log(e)
}
console.log(m.json())

// .get(id) // type:name
const query1 = m.get('Person:Chris')
console.log(query1)

// .query(function) // returns array
const query2 = m.query((e) => { return e.age < 40 })
console.log(query2)

// .json()
console.log(query2[0].json())

// .save(filename)
m.save('data/test.json')

// .load(filename)
const y = new Supramap()
y.load('data/test.json')
console.log(y.json())

