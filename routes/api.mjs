export default class {
  get(r, s, data) {
    return s.endJSON(r.server.db['user:admin'])
    /*if(!r.user) return s.writeHead(401).end()
    const path = r.url.split('/')[2]  // /api/notifications
    const from = new Date(r.data.from || '1970-01-01T00:00:00.000Z')
    return r.server.db.filter((item) => {
      const isCurrent = new Date(item.created_at) > from
      const isType = item.type === path
      return (isCurrent && isType)
    })*/
  }
}