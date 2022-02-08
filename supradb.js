import { readFileSync, writeFileSync, appendFile } from 'node:fs'
import { Server, Client } from './https.mjs'
//import readLines from './file.mjs'
//import Supramap from 'supramap/supramap.mjs'

const server = new Server()
//const map = new Supramap()
const fn = `${server.loglocation}/${server.network}.supra.txt`
server.info = {
  network: process.env.network,
  port: process.env.port || 443,
  leader: process.env.leader,
  hash: process.env.hash,
  records: 0,
  nodes: server.nodes
}

server.use([async (r, s, data, dobj) => {
  if (!dobj || (r.method == 'POST')) return false
  data._method === 'D' ? map.delete(data._id) : map.set(data._id, data)
  const hash = Hash.sha256(server.hash + '' + data)
  await appendFile(fn, `${hash}\t${data}\r\n`)
}])

server.use([(r, s) => {
  if (!r.url.startsWith('/info')) return false
  return s.end(JSON.stringify(server.info, null, 2))
}])

console.log(server.info)
server.listen(server.info.port)
console.log(`Listening on port ${server.info.port}`)

// tests
const leader = new Supra(443, 'network')
const peer1 = new Supra(543, 'network')
const peer2 = new Supra(643, 'network')

const client = new Client()
const token = client.post('https://localhost:443/token')
client.bearerToken = token
client.post(':443/api', { _method: 'C', type: 'Person', name: 'John', age: 42 })
client.post(':543/api', { _method: 'C', type: 'Person', name: 'John2', age: 52 })
client.post(':643/api', { _method: 'C', type: 'Person', name: 'John3', age: 62 })
let info = await client.fetch('https://localhost:443/info')
console.log(info)
info = await client.fetch('https://localhost:543/info')
console.log(info)
info = await client.fetch('https://localhost:643/info')
console.log(info)

client.post(':443/api', { _method: 'D', _id: 'Person:John' })
client.post(':543/api', { _method: 'D', _id: 'Person:John2' })
client.post(':643/api', { _method: 'D', _id: 'Person:John3' })
let info = await client.fetch(':443/info')
console.log(info)
info = await client.fetch(':543/info')
console.log(info)
info = await client.fetch(':643/info')
console.log(info)