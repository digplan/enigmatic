var fs = require('fs');

var fastdb = (port) => {
  
  var name = 'db.json';
  var uuname = 'uuid.json';
  
  var db = fs.existsSync(name) ? JSON.parse(fs.readFileSync(name).toString()) : {'/test':'ok'};
  var uuiddb = fs.existsSync(uuname) ? JSON.parse(fs.readFileSync(uuname).toString()) : {};
  
  var server = require('http').createServer((r, s)=>{
  var uuid = require('node-uuid');
  
    var d = '';
    r.on('data', (chunk) => d += chunk.toString());
    r.on('end', () => {
  
     //try {
      if(r.method == 'GET' && (r.url == '/' || r.url == '/index.html'))
        return resp('200', indexhtml, s);
        
      if(r.url == '/uu'){
        var id = uuid.v4();
        uuiddb[id] = true;
        fs.writeFileSync(uuname, JSON.stringify(uuiddb, null, 2));
        return s.end(id);
      }
      
      var k = r.url;
      var auth = r.headers['authorization'] || r.headers['Authorization'] || '';
      if(auth){
        if(!uuiddb[auth]) return resp('401', 'not authorized', s);
        k = auth + '|' + r.url;
      }
      console.log('requesting ' + k);
      
      if(r.method == 'GET'){
        if(!db[k])
          return resp('400', 'Invalid request: not found', s);
        return resp('200', db[k], s);
      }

      if(r.method == 'POST'){
        if(r.url != '/')  return resp('400', 'Invalid request: only POST to URL /', s);
        var id = '/' + (+new Date() + Math.random());
        var key = auth ? auth+'|'+id : id;
        db[key] = d;
        console.log(key, d);
        fs.writeFileSync(name, JSON.stringify(db, null, 2));
        return resp('201', id, s);
      }

      if(r.method == 'DELETE'){
        if(!db[k])
          return resp('400', 'Invalid request: not found', s);
        delete db[k];
        return resp('200', 'deleted', s);
      }
      
     //} catch(e){
    //    console.log(e);
    //    return resp('500', 'Internal error', s);
     //}
     
     return resp('405', 'Invalid request: Method not allowed', s);
     
    });
  
  });
  
  server.listen(port);
};

function resp(code, msg, s){
  s.writeHead(code, process.code == 200 ? "OK" : "", {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE',
      'Access-Control-Allow-Headers': 'Authorization'
  });
  s.end(msg);
}

var indexhtml = '<!HTML><link rel="shortcut icon" href="data:image/x-icon;," type="image/x-icon">';
fastdb(8080);
