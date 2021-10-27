try {
  const https = require('https'), 
      url = require('url'),
      fs = require('fs'),
      email_sender = require('../email.js'),
      crypto = require('../crypto.js').crypto(),
      key = '36062056fe165bcde403a21519a625078bd7c92caadefcde4753fe2b048fdd7e',
      log = require('../log.js'); // .insert(obj), .update(id, obj)

let signkey = crypto.createKey(key);
let auth = {};

const options = {
  cert: fs.readFileSync('./digplan.xyz.cert.txt'),
  key: fs.readFileSync('./digplan.xyz.key.txt'),
  passphrase: 'yeahbuddy'
}

const requestListener = function (req, res) {

  if(req.url == '/favicon.ico') return;

  let path = url.parse(req.url).pathname;
  const {email, code} = url.parse(req.url, true).query;

  // App and Login
  if(path == '/' && !email && !code){
    
    res.writeHead(200, {'Content-Type': 'text/html'});
    if(req.headers.cookie){
      let [email, signature] = req.headers.cookie.split('=');
      if(email && signature && crypto.verify(email, signature)){
        return res.end(fs.readFileSync('index.html'.toString()));
      }
    }
    
    return res.end(fs.readFileSync('login.html'.toString()));
  }

  if(email && !code){
      let code = Math.floor(Math.random()*(999-100+1)+100) + '' + Math.floor(Math.random()*(999-100+1)+100);
      auth[code] = email;
      email_sender.email(email, 'code: ' + code);
      return res.end(`A code has been sent to ${email}`);
  }

  if(email && code && auth[code]==email){
      // Get cookie
      let signature = crypto.sign(email);
      res.writeHead(200, {'Set-Cookie': `${email}=${signature}`});
      delete auth[code];
      return res.end(signature);
  }

  if(req.url == '/stream'){
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return setInterval(()=>res.write(`data: {"name":"${+new Date()}"} \n\n`), 1000)
  }

  try {
    return res.end(fs.readFileSync(req.url.replace('/','').toString()));
  } catch(e){
    return res.end('Unauthorized');
  }
}

const server = https.createServer(options, requestListener);
server.listen(443);

} catch(e){
   console.error(e.message);
}