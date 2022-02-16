import { readFileSync, writeFile, existsSync } from 'node:fs'
import os from 'node:os'

const readFileJSON = (filename) => {
    return JSON.parse(readFileSync(filename, 'utf8'))
}
const writeFileJSON = (filename, data) => {
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
    const [url, options] = str.split(', ')
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
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const stats = async () => {
    return {
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        cpu: process.cpuUsage(),
        pid: process.pid,
        cwd: process.cwd(),
        execPath: process.execPath,
        node_version: process.version,
        platform: process.platform,
        arch: process.arch,
        num_cores: os.cpus().length,
        memory: (()=>{ 
            const mu = process.memoryUsage(), ret = {}
            Object.keys(mu).forEach(k => ret[k] = (mu[k] / 1024 / 1024).toFixed(2) + ' MB')
            ret['osfree'] = (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + ' GB'
            ret['ostotal'] = (os.totalmem() / 1024 / 1024 /1024).toFixed(2) + ' GB'
            return ret
        })()
    }
}

export { readFileJSON, writeFileJSON, loadModules, parseHttpBasic, hash, __dirname, fetchApi, templateObj, templateArr, stats, wait }
console.log(stats())