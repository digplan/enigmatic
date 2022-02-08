Data: {
	Cache: {},
	GetCached: function(k) {return Pipeline.Data.Cache[k] || (Pipeline.Data.Cache[k] = Get(k))},
	Get: function(fn) {  
		var xmlhttp = new ActiveXObject("MSXML2.XMLHTTP") || new XMLHttpRequest;
    		xmlhttp.Open("Get", arguments[0], false, (arguments[1] || ''), (arguments[2] || ''));
    		xmlhttp.send(); 
    		var ret = xmlhttp.responseText; 
		var hdrs = xmlhttp.getAllResponseHeaders();
 		var cook = hdrs.match(/Set-Cookie.*/g);
    		xmlhttp = null; 
    		return {toString: function() { return ret }, headers: hdrs, cookies: cook };
	},
	
	Put: function(s,fn) {
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		var f = fso.CreateTextFile(fn, true);
		f.WriteLine(s);
		fso.Close;
		fso = null;
	}

	/* Example: Post("http://www.asitetopostto.com", "name=value&name2=value2etc", [optional username], [optional password]); */ 

	Post: function(u, v, func) { 
	   	var xmlhttp = window.ActiveXObject ? new ActiveXObject("MSXML2.XMLHTTP") : new XMLHttpRequest; 
   		xmlhttp.Open('POST', u, false); 
   		xmlhttp.send(v); 
   		return xmlhttp.responseText;
	},
	
	PostAsync = function (u, v, wb, wait_to, cbo, ab_to) { 
      		if(wait_to > ab_to) {alert("You cannot have a wait timeout larger than the abort timeout."); return ""; }
      		var xmlhttp = window.ActiveXObject ? new ActiveXObject("MSXML2.XMLHTTP") : new XMLHttpRequest(); 
      		xmlhttp.Open("Post", u, true);
	 	 var w_id = setTimeout(wb, wait_to);
	  	counter++;
	  	requests[counter] = xmlhttp;
	  	var c_id = setTimeout("requests["+counter+"].abort(); CursorNormal(); alert('no server')", ab_to);
	 	xmlhttp.onReadyStateChange = function() { 
			if (xmlhttp.readyState == 4) {
				clearTimeout(w_id);
				clearTimeout(c_id);
				CursorNormal();
				cbo(xmlhttp);
		  	}
	  	}
     		 xmlhttp.send(v);
      		return "1"; 
	},		

	Put: function(s,fn) {
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		var f = fso.CreateTextFile(fn, true);
		f.WriteLine(s);
		fso.Close;
		fso = null;
	},
		
	CSV2XML: function(s) { 
		var ret = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n"; 
		var sp = s.split("|"); 
		var fields = sp[0].split(","); 
		var values = sp[1]; 
		var rows = values.split(";"); 
		for(var i=0; i < rows.length-1; i++ ){ 
			ret += "<record>\n  "; 
			var rowvals = rows[i].split(","); 
			for(var j=0; j < rowvals.length-1; j++) { 
			ret += "<"+fields[j]+">"+rowvals[j]+"</"+fields[j]+">\n    "; 
		} 
		ret += "</record>\n"; 
	} 

}
