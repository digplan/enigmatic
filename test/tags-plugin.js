import { json, redir } from '../src/server.js'

export default function tagsPlugin(app) {
  const tagsByUser = (app.tagsByUser ||= new Map())

  app.routes = {
    ...app.routes,
    'GET /tags': async (req) => {
      const key = req.user?.sub || 'anonymous'
      const tags = tagsByUser.get(key) || new Set()
      return json({
        key,
        tags: [...tags].sort()
      })
    },
    'POST /tags': async (req) => {
      const body = await req.json().catch(() => ({}))
      const tag = typeof body.tag === 'string' ? body.tag.trim().toLowerCase() : ''
      if (!tag) return json({ error: 'tag is required' }, 400)

      const key = req.user?.sub || 'anonymous'
      const tags = tagsByUser.get(key) || new Set()
      tags.add(tag)
      tagsByUser.set(key, tags)
      return json(204)
    },
    'DELETE /tags': async (req) => {
      const body = await req.json().catch(() => ({}))
      const tag = typeof body.tag === 'string' ? body.tag.trim().toLowerCase() : ''
      if (!tag) return json({ error: 'tag is required' }, 400)

      const key = req.user?.sub || 'anonymous'
      const tags = tagsByUser.get(key) || new Set()
      if (!tags.has(tag)) return json(204)
      tags.delete(tag)
      tagsByUser.set(key, tags)
      return json(204)
    },
    'GET /tags/ui': async () => {
      return redir('/?view=tags')
    }
  }
}
