import { JWT } from 'jwt-tiny'
const secret = (await import(`./.secrets/jwt.mjs`)).default;
const jwt = new JWT(secret);

export default (r, s, data) => {
    if (r.headers.authorization) {
        const [type, userpass] = r.headers.authorization.split(' ')
        const [user, pass] = Buffer.from(userpass, 'base64').toString('ascii').split(':')
        console.log(user, pass)

        const exp = new Date().getTime() + (7 * 24 * 60 * 60 * 1000)
        const jwts = jwt.create({
            sub: user,
            iat: new Date().toISOString(),
            exp: new Date(exp).toISOString(),
            ip: r.socket.remoteAddress
        })
        s.setHeader('Set-Cookie', `token=${jwts}; HttpOnly; Secure; Expires=${new Date(exp).toUTCString()}`)
        return s.end(jwts)
    }
    return s.writeHead(401).end()
}