import {readFileSync} from 'node:fs'

export default function _static (r, s, data)  {

    const folder = 'public'

    if(r.url == '/')
        r.url = '/index.html'

    if(!r.url.match('.'))
        return false

    try {
        const file = r.url.replace('/', '')
        const path = `${folder}/${file}`
        return s.end(readFileSync(path).toString())
    } catch(e) {
        return r.server.functions['/404'](r, s)
    }

}