export default logout = (r, s, data) => {
    return s.setHeader('Set-Cookie', 'token=; HttpOnly; Secure; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT').end('logged out')
}