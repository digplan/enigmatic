#!/usr/bin/env node
import { vast } from './server/db/db.mjs'
import { HTTPSServer } from './server/server.mjs'

// Start Server
const server = new HTTPSServer()
await server.getMiddleware()
server.db = new vast()

server.listen(3000)
