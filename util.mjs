import { readFileSync, writeFile, existsSync } from 'node:fs'

const readFile = (filename) => {
    return JSON.parse(readFileSync(filename, 'utf8'))
}
const writeFile = (filename, data) => {
    return writeFile(filename, JSON.stringify(data, null, 2), 'utf8')
}
const loadModules = async (dirname) => {
    if (!existsSync(dirname)) return
    const obj = {}
    for (const f of readdirSync(dirname)) {
        if (!f.endsWith('.mjs')) continue
        const name = f.split('.')[0]
        obj[name] = (await import(`${dirname}/${f}`)).default
    }
    return obj
}
const parseHttpBasic = (r) => {
    if (!r.headers.authorization) return
    const [type, userpass] = r.headers.authorization.split(' ')
    return Buffer.from(userpass, 'base64').toString('ascii').split(':')
}
const hash = (str) => {
    return crypto.createHash('sha256').update(str).digest('hex')
}

const __dirname = () => {
    return new URL(filename, import.meta.url).pathname.slice(1)
}
const fetchApi = async (str, transform) => {
    const [url, options, transform] = str.split(', ')
    const f = await fetch(url, options)
    const text = await f.text(), json = await f.json()
    if(transform)
        return transform(json || text)
    return json || text
}
const templateObj = (str, obj) => {
    for(let k in obj)
        str = str.replace(new RegExp(`{${k}}`, 'g'), obj[k])
    return str
}
const templateArr = (str, arr) => {
    return arr.reduce((p, c) => p += templateObj(str, c), '')
}

export { readFile, writeFile, loadModules, parseHttpBasic, hash, __dirname, fetchApi, templateObj, templateArr}