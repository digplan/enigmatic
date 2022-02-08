var lang = {
	Version: '70401',
	GlobalRef: window,
	DocRef: document,
	Lang: {
		Import: function(v, f) {Pipeline.GlobalRef[v] = f},

		LoadScript: function(fn) {				
			var e = Pipeline.DocRef.createElement('script');
			e.src = fn; 
			Pipeline.DocRef.write("hi");
			var sc = Pipeline.DocRef.body.appendChild(e); 
			var s = Pipeline.DocRef.scripts;
			return s[s.length-1].src == e.src;
		},

		Clone: function(o, deep) {
  			var n = new Object();
  			for (var p in o)
    				if (!deep)
      					n[p] = this[property];
    					else if (typeof this[p] == 'object')
      						n[p] = this[p].clone(deep);
    					else
      						n[p] = this[p];
  				return n;
		},

		GetAllLoadedFunctions: function() {
  			var ret = "";
  			scrs = document.scripts;
  			for(var i in scrs) { 
    			if(typeof scrs[i] == 'object') {
      			var c = scrs[i].outerHTML;
	  		var m = c.match(/.*<SCRIPT\s+SRC\s*\=\s*[\'\"]([^\'^\"]+).*><\/SCRIPT>/i);
	  		if(m) {
	    			var code = Get(m[1]);
				ret += GetFunctions(code) + '\n';
	  		} else {
				ret += GetFunctions(c) + '\n';
	  		}
  			return ret;
		},

		getFunctionCode: function(fname) {   return eval(name) || null;  },

		IsValidFunctionCall: function(fname) { return !!GetFunctionCode(fname); },

		RemoveComments: function(s) { return s.replace(/(\r|\n)/g," ").replace(/\/\*.*\*\//g,""); },

		IsObject: function(o) { 
			 return !!e.toString().startsWith("[object"); 
		},

		Before: function(o, prefunc, func) {
			 var f = o[func];
			 o['__'+fname] = f;
			 o[fname] = function() {return f.apply(this,prefunc(arguments)) }
		},

		Restore: function(o, fname) {
			o[fname] = o['__'+fname];
			o['__'+fname] = null;
		},

		Globals: function() {
  			return inspect(this);
		},

		backgroundThread: function (f) {
  			setTimeout(f, 1);
		},

		test: function(s, $out) { 
  		  try
		  {
	  		alert(getFunctions());
			var fn = getFunctions(s);
       			for(i in fn) $out(fn[i] + '\n');
         		$out("\n*** Running Tests ***\n");
         		var rx = new RegExp("Test: (.*)","g");
         		var num = 0;
         		var m;
         		var ret = "";
         		while(m = rx.exec(s)) {
	        	if(!m[1].startsWith("(")) {
		       		var v = eval(m[1]);
		       		$out(m[1] + " Result: " + ( v ? HTMLColorGreen("Successful") : HTMLColorRed("Failed") )+ HTML_LS);
	        	}
         	  } catch(e) {
	  		$out("Error evaluating: " & m[1]);
		  }
    		  return ret;
		}, 

		/* self test
		$(test(document.scripts[0].outerHTML));
		*/

		Inspect: inspect(obj) { 
  			var ret = ""; 
  			for (x in obj) ret += x + ": " + obj[x] + ";"; 
  			return ret; 
		} 

}