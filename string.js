String: {
		
	StartsWith: function(s, z) { return s.slice(0,z.length) == z },
	EndsWith: function(s, z) { return s.substring(s.length-z.length) == s },			
	Contains: function(s, z) { return z.indexOf(s) != -1 },
	Trim: function(s) { 
			var o = /^(\s*)([\W\w]*)(\b\s*$)/;
   			o.test(s) ? return s.replace(o, '$2') : return s;
	},
	RemoveLastChar: function(s) { return s.substring(0, s.length-2) },
	RemoveFirstChar: function(s) { return s.substring(1, s.length) },
	TrimUntil: function(s, z) { return s.substring(s.indexOf(z)) }	
	
	/* Example:  removeLastChar("Chris");  == Chri */
	RemoveLastChar: function(s) { 
  		return s.substring(0, s.length-2); 
	}, 

	/* Example:  removeFirstChar("Chris");  == hris */
	RemoveFirstChar: function(s) { 
  		return s.substring(1, s.length); 
	},

	/*  Example: "dddddefghi".trimUntil("e"); returns "efghi" */
	TrimUntil: function(s) { 
  		return this.valueOf().substring(this.valueOf().indexOf(s)); 
	} 

	/*  Example: getInnerText("chris", "c", "i" ; returns "hr" */
	GetInnerText: function(s, begintext, endtext) { 
		var ret = new Array(); 
  		var r = new RegExp(""+begintext+"(.*)"+endtext,"g"); 
  		var match;
  		while (match = r.exec(s)) ret.push(match[1]); 
  		return ret; 
	} 

}


String.prototype.chars = function(intcode) {
     var me = this.valueOf();
     var a = new Array();
     for(var i=0;i<me.length;i++) {
	   intcode ? a.push(me.charCodeAt(i)) : a.push(me.charAt(i));
	 }
	 return a;
}
/* Example:  "Christopher".startsWith("Chris")  returns true;  */
String.prototype.startsWith = function(s) {
  if (this.valueOf().slice(0,s.length) == s) return true;
}

/* Example:  "Christopher".endsWith("her")  returns true;  */
String.prototype.endsWith = function(s) {
  if (this.valueOf().substring(this.valueOf().length-s.length) == s) return true;
}

/* Example:  "Christopher".contains("her")  returns true;  */
String.prototype.contains = function(s) {
  return this.valueOf().indexOf(s) != -1
}

String.prototype.trim = function(s) {
   var o = /^(\s*)([\W\w]*)(\b\s*$)/;
   if (o.test(this.valueOf())) return this.valueOf().replace(o, '$2');
}

/*  Example: "xmlstring".selectRegexp("/matchstr(.*)end/");  returns array  */
String.prototype.SelectRegexp = function(q) { 
  var val = String(this.valueOf()); 
  if (val.match("http:")) val = Get(val);
  var rx = new RegExp(q, "g");
  var match;
  while (match = rx.exec(val)) ret.push(match[1]);
  return ret;
}
