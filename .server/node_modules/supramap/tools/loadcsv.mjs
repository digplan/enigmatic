
// load.csv, put map at map.json
// first column is id

import {readFileSync} from 'fs'
import {Supramap} from '../supramap.mjs'
const csv = readFileSync('load.csv', 'utf8')
const lines = csv.split('\r\n')
const headers = lines[0].split(',')
const map = new Supramap()
map.load('tools/map.json')

const type = 'timezone'

lines.slice(1).map(line => {
    const data = line.split(',')
    let p = 0, obj = {}
    for(const field in data) {
        obj[headers[p]] = data[p]
        p++
    }
    obj.id = type + ':' + data[0]
    console.log(obj)
    map.set(obj)
})

map.save('tools/map-loaded.json')