const cache_name = 'e-master'
const do_not_cache = []

const c = async (req) => {
    const cache = await caches.open(cache_name)
    const cached = await cache.match(req)
    if (cached) return cached

    const res = await fetch(req)
    const url = req.url.split('/').pop()

    if (res.status == 200 && !do_not_cache.includes(url))
        cache.put(req, res.clone())

    return res
}

self.addEventListener('fetch', (ev) => {
    if (ev.request.url.endsWith('expiresw'))
        self.registration.unregister()
    ev.respondWith(c(ev.request))
})