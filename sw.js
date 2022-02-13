self.addEventListener('install', async (event)=> {
   const inst = async() => {
       const c = await caches.open('app-cache')
       c.addAll(['/package.json'])
   }
   event.waitUntil(inst())
}) 

const cachedResource = async req => {
    const cache = await caches.open('app-cache')
    const cached = await cache.match(req)
    if(cached) return cached
    const res = await fetch(req)
    if (!res || res.status !== 200 || res.type !== 'basic')
        return res
    cache.put(req, res.clone())
    return res
}

self.addEventListener('fetch', event =>
    event.respondWith(cachedResource(event.request))
)