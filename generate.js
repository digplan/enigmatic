const fs = require('fs')

var log = {}, min = +new Date - (1000*60*60*24*120), count = 100000
var users = JSON.parse(fs.readFileSync('./random_users.json')).results

while(count-- > 0)
  addItem(min)
  
additem = min => {
  min += Math.floor(Math.random()*10000)
  if(!(i % 3)) return put(min)
  if(!(i % 20)) return delet(min)
  if(!(i % 200)) return patch(min)
  post(min)
}

put = min => {
  var updateitem = log[pickRandomKey(log)]
  var newitem = JSON.parse(JSON.stringify(updateitem))
  log[min] = {method:'PUT', upd: newitem, old: updateitem}
}
delet = min => {
  log[min] = {method:'DELETE', ''}
}
post = min =>
  log[min] = {method:'POST', upd: ''}
patch = min =>
  log[min] = {method:'PATCH', upd: ''}

function pickRandomKey(log){
  var keys = Object.keys(log)
  return keys[ keys.length * Math.random() << 0];
}

console.log(Object.keys(ordered).length, process.memoryUsage())
fs.writeFileSync('./dblog.txt', JSON.stringify(ordered, null, 2))