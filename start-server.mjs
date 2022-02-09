import { HTTPSServer } from 'https-microservice'

const dirname = new URL(import.meta.url).pathname.split('/').slice(0, -1).join('/').slice(1)
if (process.platform !== 'win32') dirname = '/' + dirname
const port = 8080

const server = new HTTPSServer('./.server/.secrets/server.key', './.server/.secrets/server.crt')
await server.getMiddleware(dirname + '/.server')
server.listen(port)
console.log(`listening on port ${port}`)