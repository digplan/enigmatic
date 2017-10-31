var fs = require('fs');
var db = {
  
  data: {},
  log: {},

  load: id => {
    if(fs.existsSync('./db.txt')) db.data = JSON.parse(fs.readFileSync('./db.txt'));
    if(fs.existsSync('./dblog.txt')) db.log = JSON.parse(fs.readFileSync('./dblog.txt'));
  },
  dump: () => {
    fs.writeFileSync('./db.txt', JSON.stringify(db.data, null, 2));
    fs.writeFileSync('./dblog.txt', JSON.stringify(db.log, null, 2));
  }
};
db.load();

function server(r,s){
   if(r.url.match('favicon')) return s.end();
   if(r.url=='/index.html')
     return s.end(fs.readFileSync('./index.html'));

   if(r.method == 'GET'){
     var id = r.url.replace('/', '');
     console.log(r.query);
     var query = require('url').parse(r.url, true).query;
     if(!query){
       if (!db.data[id]) return s.end('{"error": "not found"}');
 
       s.end(JSON.stringify(db.data[id]));
     }
     var ret = {};
     for(id in db.data){
       for(k in query){
         if(!db.data[id][k] || (db.data[id][k]!=query[k]))
           ret[k] = db.data[id];
       }
     }
     s.end(JSON.stringify(ret));
   }

   if(r.method == 'POST'){
     var o = JSON.parse(r.body);
     if(!o['@']){
         var id = Math.random().toString(16).slice(2);

         o['@'] = id;
         var log = db.log[+new Date()] = {'create': o };
         db.data[id] = o;
         console.log(log);
         s.end(JSON.stringify(log));
     } else {
         console.log('<< ' + r.body);
         if (!db.data[o['@']]) return s.end(`{"error": "not found ${o['@']}"}`);
 
         var logu = {'update': {"old":db.data[o['@']], "new":o} };
         console.log(logu);
         db.log[+new Date()] = logu;  
         db.data[id] = o;
         s.end(JSON.stringify(logu));
     }
     db.dump();
   }

   if(r.method == 'DELETE'){
     var id = r.url.replace('/', '');
     if (!db.data[id]) return s.end('{"error": "not found"}');

     var log = db.log[+new Date()] = { "delete": db.data[id] };

     delete db.data[id];

     db.dump();
     s.end(JSON.stringify(log));
   }
}
require('http').createServer(server).listen(80);
console.log('started server');
