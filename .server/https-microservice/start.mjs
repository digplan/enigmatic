#!/usr/bin/env node

import { HTTPSServer } from "./https-microservice.mjs"
const server = new HTTPSServer('keys/key.pem', 'keys/cert.pem')
await server.getMiddleware()

console.log(server.middleware, server.routes)
server.listen(3000)
console.log('Server listening on port 3000')
