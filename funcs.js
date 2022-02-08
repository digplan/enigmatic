var fs = require('fs');
var Twit = require('twit');

module.exports = (function(){
  global.get = function(url, cb){
    require('request')(url, function(e, r, b){
      (cb || console.log.bind(console))(e||b);
    });
  };
  global.btcvalidate = function(address){
    return require('bitcoin-address').validate(address);
  }
  global.btcbalance = function(addr, cb){
    if(!addr)
      addr = require(process.cwd() + '/config.json').btcaddr;
    get('https://blockchain.info/q/addressbalance/'+addr, cb);
  };
  global.btctx = function(txno, sendr_or_recvr, cb){
    get('https://blockchain.info/q/txresult/'+txno+'/'+sendr_or_recvr, cb);
  }; 
  global.btcstream = function(addr, cb){
    var ws = require('ws'); var sock = ws.connect('wss://ws.blockchain.info/inv');
    sock.onmessage = cb||console.log.bind(console);
    if(!addr)
      sock.send('{"op":"unconfirmed_sub"}');
    else
      sock.send('{"op":"addr_sub", "addr":"'+addr+'"}');
  }
  global.btcqr = function(toaddr, btcamt, message, response_or_filename){
    var url = 'https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=bitcoin:'+toaddr+'?amount='+btcamt+'&message='+message;
    if(typeof response_or_filename === 'string')
      response_or_filename = fs.createWriteStream(response_or_filename);
    require('request')(url).pipe(response_or_filename);
  }

  global.btcsend = function(to, satoshi, note, cb){
    var auth = require(process.cwd()+'/config.json');
    get('https://blockchain.info/merchant/'+auth.btcwif+'/payment?to='+to+'&amount='+satoshi+'&note='+note, cb);
  }
  global.btcnewaddress = function(){
    var bitcoin = require('bitcoinjs-lib');
    var key = bitcoin.ECKey.makeRandom();
    return key.pub.getAddress().toString() + ';' + key.toWIF();
  }

  global.exchangerate = function(from, to, cb){
    get('https://jsonp.nodejitsu.com?&url=http://rate-exchange.appspot.com/currency%3Ffrom%3D'+from+'%26to%3D'+to, cb);
    return;
  }
  global.btcprice_blockchain = function(){
    get('https://blockchain.info/ticker', cb);
  }
  global.btcprice_bitpay = function(){
    get('https://bitpay.com/api/rates', cb);
  }
  global.btcprice_btcchina = function(cb){
    get('https://data.btcchina.com/data/ticker?market=btccny', cb);
    return;
  }
  global.btcprice_okcoin = function(cb){
    get('https://www.okcoin.cn/api/ticker.do', cb);
    return;
  }
  global.btcprice_bitstamp = function(cb){
    get('https://www.bitstamp.net/api/ticker/', cb);
    return;
  }
  global.btcprice_bitfinex = function(cb){
    get('https://api.bitfinex.com/v1/pubticker/BTCUSD', cb);
  }
  global.btcprice_kraken = function(cb){
    get('https://api.kraken.com/0/public/Depth?pair=XBTUSD&count=1', cb);
  }
  global.btcprice_btce = function(cb){
    get('https://btc-e.com/api/2/btc_usd/ticker', cb);
  }
  global.btcprice_campbx = function(cb){
    get('http://campbx.com/api/xticker.php', cb);
  }
  global.btcprice_justcoin = function(cb){
    get('https://justcoin.com/api/v1/markets', cb);
  }
  global.btcprice_coinbase = function(cb){
    get('https://api.coinbase.com/v1/prices/buy', function(r){
       var buy = JSON.parse(r);
       get('https://api.coinbase.com/v1/prices/sell', function(s){
         cb({buy: buy, sell: JSON.parse(s)});
       });
    });
  }  

  var btcc = null;
  global.btctrade_btcc = function(which, size, price, cb){
    var auth = require(process.cwd() + '/config.json');
    if(!btcc){
      var BTCChina = require('btcchina');
      btcc= new BTCChina(auth.btcc_key, auth.btcc_secret);
    }
    btcc[which+'Order'](price, amount, cb||console.log.bind(console));  
  }
  global.btctrade_btccticker = function(size, price, cb){
    var auth = require(process.cwd() + '/config.json');
    if(!btcc){
      var BTCChina = require('btcchina');
      btcc= new BTCChina(auth.btcc_key, auth.btcc_secret);
    }
    btcc.ticker(cb||console.log.bind(console));      
  }

  global.uberproducts = function(lat, long, cb){
    var auth = require(process.cwd() + '/config.json').uber_server_token;
    get('https://api.uber.com/v1/products?server_token='+token+'&latitude='+lat+'&longitude='+long, cb);
  }
  global.uberestimatetime = function(startlat, startlong, endlat, endlong){
    var auth = require(process.cwd() + '/config.json').uber_server_token;
    var qs = 'server_token='+token+'&start_latitude='+startlat+'&start_longitude='+startlong+'&end_latitude='+endlat+'&end_longitude='+endlong;
    get('https://api.uber.com/v1/estimates/time?' + qs, cb);
  }
  global.uberestimateprice = function(startlat, startlong, endlat, endlong){
    var auth = require(process.cwd() + '/config.json').uber_server_token;
    var qs = 'server_token='+token+'&start_latitude='+startlat+'&start_longitude='+startlong+'&end_latitude='+endlat+'&end_longitude='+endlong;
    get('https://api.uber.com/v1/estimates/price?' + qs, cb);
  }

  global.dumpdb = function(obj){
    obj && fs.writeFileSync('./db.json', JSON.stringify(obj, null, 2));
  }

  global.tweet = function(what, token, tsecret, cb){
    var dir = process.cwd() + '/config.json';
    var auth = require(dir);
    if(token && tsecret){
      auth.access_token = token; auth.access_token_secret = tsecret;
    }
    var T = new Twit(auth);
    T.post('statuses/update', { status: what }, function(err, data, response) {
      (cb || console.log.bind(console))(data);
    });
  }
  global.follow = function(who, token, tsecret, cb){
    var dir = process.cwd() + '/config.json';
    var auth = require(dir);
    if(token && tsecret){
      auth.access_token = token; auth.access_token_secret = tsecret;
    }
    var T = new Twit(auth);
    T.post('friendships/create', { screen_name: who }, function(err, data, response) {
      (cb || console.log.bind(console))(data);
    });
  }
  global.retweet = function(id, token, tsecret, cb){
    var auth = require(process.cwd()+'/config.json');
    if(token && tsecret){
      auth.access_token = token; auth.access_token_secret = tsecret;
    }
    var T = new Twit(auth);
    T.post('statuses/retweet/:id', { id: id }, function (err, data, response) {
      (cb || console.log.bind(console))(data);
    })  
  }
  global.stream = function(what, cb){
    var auth = require(process.cwd()+'/config.json');
    var T = new Twit(auth);
    var stream = T.stream('statuses/filter', { track: what })
    stream.on('tweet', function (tweet) {
      (cb || console.log.bind(console))(tweet);
    })
  }

  global.email = function(from, to, subject, body, cb){
    var url = 'https://api:'+auth.mailgun_api_key+'@api.mailgun.net/v2/' + 
      auth.mailgun_domain+'/messages?from='+from+'&to='+to+'&subject='+subject+'&text='+body;
    require('request').post(url, cb || console.log.bind(console));
  }

  global.server = function(port, ip, nodirs) {
    port = port || 80;
    var express = require('express');
    var app = express();
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.engine('html', require('hogan-express'));
    app.set('view engine', 'html');
    var path = process.cwd();
    var configpath = path  + '/config.json';

    if(fs.exists(configpath))
      app.config = require(configpath);

    if(!nodirs && !fs.existsSync(path  + '/static')){
      fs.mkdirSync(path  + '/static');
      fs.writeFileSync(path + '/static/index.html', ''); 
    }
    if(!nodirs)
      app.use(express.static(path  + '/static'));

    if(!nodirs && !fs.existsSync(path  + '/views')){
      fs.mkdirSync(path  + '/views');
      fs.writeFileSync(path + '/views/index.html', ''); 
    }
    app.listen(port, ip);
    return app;
  };

  global.store = function(port, ip){
    var app = server(port, ip, 1);
    app.get('/:dbname/:val', function(r, s){
      
    })
  }

  var c = require('crypto');

function base58encode(buffer) {
  var ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  var digits = [0];
  for (var i=0, carry=0; i < buffer.length; i++) {
    for (var j = 0; j < digits.length; j++) digits[j] <<= 8;
    digits[0] += buffer[i];
    for (j = 0; j < digits.length; ++j) {
      digits[j] += carry;
      carry = (digits[j] / 58) | 0;
      digits[j] %= 58;
    }
    while (carry) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  for (var i=0; buffer[i] === 0 && i < buffer.length - 1; i++) digits.push(0);
  return digits.reverse().map(function(digit) { return ALPHABET[digit] }).join('');
}

function sha256(buffer){
  return c.createHash('sha256').update(buffer).digest();
}

function ripemd160(buffer){
  return c.createHash('ripemd160').update(buffer).digest();
}

function b58check(buffer) {
  var hash = sha256(sha256(buffer));
  return base58encode(Buffer.concat([buffer, hash.slice(0, 4)]));
}

global.btc_createaddress = function(passphrase){
  
  passphrase = passphrase || c.randomBytes(32).toString('hex');
  // private key aka secret exponent
  var secret_exponent = Buffer.concat([new Buffer('80', 'hex'), sha256(passphrase)]);
  var wif = b58check(secret_exponent);
  console.log(wif);

//
  var public_key = '04c456e5eb3f7e2f9ad4d046a0410fb5d3233dc3dacaf79eac3dc8384154126f141a46ae5b897f16e6d578ee3087660aee5fc7294c4cd5e5e21e9148fea09eff75';
  var hash160 = ripemd160(sha256(new Buffer(public_key, 'hex')));
  var btcaddress = b58check(Buffer.concat([new Buffer('00', 'hex'), hash160]));
  console.log(btcaddress);
}

})();
