const Static = (r, s) => {
    if (r.method !== 'GET')
        return false
    if (!fileCache) {
        fileCache = {}
        const files = readdirSync('public')
        files.forEach((f) => {
            fileCache[`/${f}`] = readFileSync(`public/${f}`, 'utf-8')
        })
        console.log(`fileCache: ${Object.keys(fileCache)}`)
    }
    const filekey = (r.url === '/') ? '/index.html' : r.url
    const fileContents = fileCache[filekey]
    return fileContents ? s.end(fileContents) : s.writeHead(404).end()
}

const Api = (r, s, data) => {
    if ((r.method != 'POST') || (r.url != '/api'))
        return false
    return s.end(`API: ${data}`)
}

const badMethod = (r, s) => {
    if (!r.method.match(/GET|POST/))
        return s.writeHead(405).end('Method not allowed')
}


authorize(userpass: string[]) : { user: string, token: string } {
    return { user: '', token: '' }
}

permissions(user: String) : String | false {
    return ''
}

AUTH(r: IncomingMessage, s: ServerResponse) : EndMiddleware {
    let [type, val] = r.headers.authorization.split(' ')
    if (type == 'BASIC') {
        const userpass = Buffer.from(val, 'base64').toString('ascii').split(':')
        const { user, token } = this.authorize(userpass)
        if (!user || !token) {
            s.writeHead(401).end()
            return true
        }
        this.tokens[token] = user
        s.end(token)
        return true
    }
    if (type == 'BEARER') {
        if (r.url === '/logout' && this.tokens[val]) {
            delete this.tokens[val]
            s.writeHead(302, 'Location: /').end()
            return true
        }
        const user = this.tokens[val]
        if (!user) {
            s.writeHead(401).end()
            return true
        }
    }
    return false
}

STATIC(r: IncomingMessage, s: ServerResponse) : EndMiddleware {
    if (r.method !== 'GET')
        return false
    const fn = `./public${(r.url == '/') ? '/index.html' : r.url}`
    if (existsSync(fn)) {
        s.end(readFileSync(fn).toString())
        return true
    }
}

EVENTS(r: IncomingMessage, s: ServerResponse) : EndMiddleware {
    if (r.url !== '/events')
        return false
    s.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    })
    const conn_id = new Date().toISOString() + Math.random()
    const clients = this.sse_clients
    clients[conn_id] = s
    s.socket.on('close', function () {
        console.log('Client leave')
        delete clients[conn_id]
    })
    return true;
}

NOTFOUND(r: IncomingMessage, s: ServerResponse) : EndMiddleware {
    s.writeHead(404).end()
    return true
}