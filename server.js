const PROTOCOL = require('http')
const FS = require('fs')
const DATA = FS.existsSync('./data.json') ? JSON.parse(FS.readFileSync('./data.json').toString()) : {}
const SAVE = FS.writeFileSync('./data.json', JSON.stringify(DATA, null, 2))

//const cert = fs.readFileSync('./digplan.xyz.cert.txt')
//const key = fs.readFileSync('./digplan.xyz.key.txt')

const app = (r, s) => {

    if(r.url == '/')
        return s.end(FS.readFileSync('./index.html').toString())
    
    if(r.url == '/index.js')
        return s.end(FS.readFileSync('./index.js').toString())

    if(r.url == '/css.css')
        return s.end(FS.readFileSync('./css.css').toString())

    s.end('Not found');
}

const server = PROTOCOL.createServer(app).listen(80)
console.log(server)