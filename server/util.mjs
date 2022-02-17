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
const stats = () => { return process.report.getReport() }

const time = {
    seconds: (sec) => sec * 1000,
    minutes: (min) => min * 60 * 1000,
    hours: (hour) => hour * 60 * 60 * 1000,
    days: (day) => day * 24 * 60 * 60 * 1000,
    weeks: (week) => week * 7 * 24 * 60 * 60 * 1000,
    months: (month) => month * 30 * 24 * 60 * 60 * 1000,
    years: (year) => year * 365 * 24 * 60 * 60 * 1000,
    ago_text: (iso) => {
        const agoms = (new Date.now() - ms) - new Date(iso)
        if (agoms < seconds(30)) return 'just now'
        if (agoms < minutes(1)) return `${Math.floor(agoms / seconds(1))} seconds ago`
        if (agoms < hours(1)) return `${Math.floor(agoms / minutes(1))} minutes ago`
        if (agoms < days(1)) return `${Math.floor(agoms / hours(1))} hours ago`
        if (agoms < weeks(1)) return `${Math.floor(agoms / days(1))} days ago`
        if (agoms < months(1)) return `${Math.floor(agoms / weeks(1))} weeks ago`
        if (agoms < years(1)) return `${Math.floor(agoms / months(1))} months ago`
        if (agoms < years(2)) return `${Math.floor(agoms / years(1))} year ago`
        return `${Math.floor(agoms / years(2))} years ago`
    }
}


export { readFileJSON, writeFileJSON, loadModules, parseHttpBasic, hash, __dirname, fetchApi, templateObj, templateArr, stats, wait, time }
console.log(stats())