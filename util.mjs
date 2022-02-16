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
export { readFile, writeFile, loadModules }