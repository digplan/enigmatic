const hashpass = (pass) => {
    const hash1 = crypto.createHash('sha256').update(pass).digest('hex')
    return crypto.createHash('sha256').update(hash1).digest('hex')
}

export default (r, s, data) => {
  
  if(!r.server.db) 
    r.server.db = new Supramap('./db/db.json')
  
  const db = r.server.db
  const [,funcname] = r.url.split('/')
  
  switch (r.method) {
    case 'GET':
      return db[funcname] ? db[funcname](r, s, data) : s.end(db.get[key])
    case 'POST':
          let op = await r.json()
          op.id = op.type + ':' + op.name
          db[op.id] = op
          return s.writeHead(201).end()
    case 'PATCH':
          let op = await r.json()
          op.id = op.type + ':' + op.name
          db[op.id] = op
          return s.writeHead(201).end()
    case 'DELETE':
          let od = await r.json()
          delete db[od.id]
          return s.writeHead(200).end()
    case 'PUT':
      // TODO
    default:
       return s.writeHead(405).end() 
  }
}
