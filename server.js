var fs = require('fs')
var db = {
  data: {"SAVED-all": 'true'},
  log: {},
  load: id => {
    if(fs.existsSync('./db.txt')) 
      db.data = JSON.parse(fs.readFileSync('./db.txt'))
    if(fs.existsSync('./dblog.txt')) 
      db.log = JSON.parse(fs.readFileSync('./dblog.txt'))
  },
  dump: () => {
    fs.writeFileSync('./db.txt', JSON.stringify(db.data, null, 2))
    fs.writeFileSync('./dblog.txt', JSON.stringify(db.log, null, 2))
  }
};
db.load();

function log(method, uid, mnew, old){
  var dte = +new Date()
  var logitem = {time: dte, "method": method, "uid": uid, "new": mnew, "old": old}
  console.log('logging ' + JSON.stringify(logitem))
  db.log[dte] = logitem
  return JSON.stringify(logitem)
}

function rewind(time){
  if(!String(time).match(/^\d{13}$/))
    if(isNaN(time = Date.parse(time)))
      throw Error(`invalid time ${time}`)
  console.log(time)
  var newdb = JSON.parse(JSON.stringify(db.data))
  var logitem = null
  while(logitem = db.log.pop()){
    if(logitem.method == 'POST') delete newdb.data[logitem.uid]
    if(logitem.method == 'PUT') newdb.data[logitem.uid] = logitem.old
    if(logitem.method == 'DELETE') newdb.data[logitem.uid] = logitem.old
    if(logitem.method == 'PATCH') delete newdb.data[logitem.uid]
  }
}

function getStats(){
  var ret = {count: Object.keys(db.data).length}
  var saved = saveds.map(k => ({[k]: db.data[k]}))
  ret.saved = saved
  return JSON.stringify(ret)
}

function getSaved(r){
  return Object.keys(db.data).filter(r => !!r._saved)
}

function get(r, s){
  if (db.data[cmd])
    return s.end(JSON.stringify(db.data[cmd]))
  if (cmd == 'stats')
    return getStats()
    
  var saveds = getSaved(r)
  if (!saveds.length) 
    return s.end(`{'error': 'not found'}`)
    
  var qcmd = saveds.filter(r => r._saved==cmd)
  if (!qcmd.length)
    return s.end(`{'error': 'not found'}`)
  var f = new Function('rec', 'return ' + qcmd[0])
  var ret = Object.values(db.data).filter(f)
  var resp = {query: qcmd, results: JSON.stringify(ret)}
  resp = JSON.stringify(resp)
  s.end(resp);
}

function patch(r, s){
  db.data[r.body.uid] = r.body
  db.dump()
  s.end(log('POST', r.body.uid, r.body, null))
}

function post(r, s){
  db.data[r.body.uid] = r.body
  db.dump()
  s.end(log('POST', r.body.uid, r.body, null))
}

function put(r, s){
  if(!db.data[cmd]) return s.end(`{'error': 'not found'}`)
  var mlog = log('PUT', r.body.cmd, r.body, db.data[cmd])
  db.data[cmd] = r.body;
  db.dump()
  s.end(mlog)
}

function del(r, s){
  if (!db.data[r.body.cmd]) return s.end('{"error": "not found"}')
  var old = db.data[r.body.cmd]
  delete db.data[r.body.cmd]
  db.dump();
  s.end(log('DELETE', r.body.cmd, null, old))
}

function server(r,s){
   var body = '';
   r.on('data', function (data) {
     body += data
     if (body.length > 1e6) r.connection.destroy()
   });
   r.on('end', function () {
     if(body)
       r.body = JSON.parse(body) || {}
     if(r.url.match('favicon')) return s.end()
     r.body.cmd = r.url.replace('/', '')
     r.body.uid = +new Date
     if(r.method == 'GET') get(r, s)
     if(r.method == 'PATCH') patch(r, s)
     if(r.method == 'POST') post(r, s)
     if(r.method == 'PUT') put(r, s)
     if(r.method == 'DELETE') del(r, s)
     body = null
   });
}

require('http').createServer(server).listen(80);
console.log('started server');
