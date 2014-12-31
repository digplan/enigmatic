var AJAX = {};

(function (AJAX) {

  var json2qs = function(o) {
    if (typeof o !== 'object') return o;
    var a = [];
    for (i in o) a.push(i + '=' + o[i]);
    return a.join('&');
  }
  
  AJAX.method = function(verb, u, d, cb) {
    var XMLHttpRequest = typeof window !== 'undefined' ? window.XMLHttpRequest : require('xhr2');
    var x = new XMLHttpRequest;
    if (verb == 'GET' && d && Object.keys(d).length) u = u + '?' + json2qs(d);
    x.open(verb, u, true);
    if (verb != 'GET') {
      x.setRequestHeader('accept', 'application/json');
      x.setRequestHeader('Content-type', 'application/json');
      if (typeof d === 'object') d = JSON.stringify(d);
    }
    x.send(d);
    x.onload = function(r) {
      var resp = r.target.responseText;
      try {
        resp = JSON.parse(resp);
      } catch (e) {}

      var err = r.target.status.toString()[0] !== "2";
      (cb || console.log.bind(console))(resp);
    };
  }

  AJAX.get = AJAX.method.bind(this, 'GET');
  AJAX.head = AJAX.method.bind(this, 'HEAD');
  AJAX.post = AJAX.method.bind(this, 'POST');
  AJAX.put = AJAX.method.bind(this, 'PUT');
  AJAX.delete = AJAX.method.bind(this, 'DELETE'); 
  
})(typeof exports !== 'undefined' ? exports : AJAX);


function ajax(){
  ondata.call(this);
  var e = this;
  AJAX.get(e.attr('href'), null, function(b){
    try{
      b = jsyaml.load(b);
    } catch(e){}
    e.dispatchData(b)
  });
}

