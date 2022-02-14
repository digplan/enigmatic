const hash = async (s) => {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default async (r, s, data) => {
    if (r.user) return
    const { authorization, cookie } = r.headers
    if (authorization) {
        const [type, userpass] = authorization.split(' ')
        const [user, pass] = Buffer.from(userpass, 'base64').toString('ascii').split(':')
        const hashed = await hash(await hash(pass))
        if (hashed !== r.server.db[`user:${user}`].pass) return
        r.user = user
    }
}