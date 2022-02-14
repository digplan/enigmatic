const hash = (s)=> {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default (r, s, data) => {
    if (r.user) return
    const [type, userpass] = r.headers.authorization.split(' ')
    const [user, pass] = Buffer.from(userpass, 'base64').toString('ascii').split(':')
    const hashed = hash(hash(pass))
    const pass = r.server.db[`user:${user}`].pass
    if (!pass || hashed !== pass) return
    r.user = user
}