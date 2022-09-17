import http from 'node:http'
import { read } from 'instax'

http.createServer(({url}, s) => {
    console.log(url)
    s.end(read(`.${url}`))
}).listen(3000)

console.log('started on 3000')
