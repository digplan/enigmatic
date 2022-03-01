import fs from 'node:fs'
      export default {
        _debug: ({ r, s, db }) => console.log(r.url, r.method),
        '/': ({ s }) => s.end(fs.readFileSync('index.html', 'utf-8')),
        '/enigmatic.js': e => {
          e.s.writeHeader(200, 'Content-Type', 'text/javascript')
          e.s.end(fs.readFileSync('enigmatic.js', 'utf-8'))
        },
        'tables': name => ([k, v]) => k.match(name + ':')
      }