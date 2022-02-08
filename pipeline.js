
/* 
Pipeline 
Revision 60601

<script>

*/ 

var HTML_LS = "<br/>";
var requests = new Object();
var counter = 0;
var cache = new Object();

$d = document;

function getCached(k) {
  if(!cache[k]) cache[k] = Get(k);
  return cache[k];
}

/**************** Data access *********************/ 

/* Example: "http://www.yahoo.com".Get(); */ 
/*
*/
String.prototype.Get = function() { 
  if (this.valueOf().startsWith("http:")) return Get(this.valueOf()); 
} 

/* 
*/ 
String.prototype.Post = function(v, u, p) { 
  if (this.valueOf().startsWith("http:")) return Post(this.valueOf(), v, u, p); 
} 

function preloadPicture(name, url, h, w) {
  var p = (h != null && w != null) ? new Image(h, w) : new Image();
  p.src = url;
  cache[name] = p;
  return p;
}

function showCacheKeys() {
  for(var item in cache) alert(item & ": " & cache[item]);
}

function backgroundThread(f) {
  setTimeout(f, 1);
}

function $(t) { document.write(t); }

/* Example: getCookies("http://www.yahoo.com"); */ 
function getCookies(u) {
      var x = getResponseHeaders(u);
	  var r = new RegExp("Set-Cookie\: (.*)","g");
	  var m, ret="";
	  while(m = r.exec(x)) ret += (m[1]+"\x01");
      return ret;
}

/*  Example:  
	Test:  !alerttest("ok")

*/
function alerttest(f) {
  alert(f);
}


/* Test: !!getResponseHeaders("http://dtoday.discoverfinancial.com")
*/
function getResponseHeaders(u) {
   var pd = "";
   arguments.length == 2 ? pd = arguments[1] : pd = "";
   var xmlhttp = window.ActiveXObject ? new ActiveXObject("MSXML2.XMLHTTP") : new XMLHttpRequest; 
   xmlhttp.Open('GET', u, false); 
   xmlhttp.send(pd);
   return xmlhttp.getAllResponseHeaders();
}

/* Example: Post("http://www.asitetopostto.com", "name=value&name2=value2etc", [optional username], [optional password]); */ 
function Post(u, v, func) { 
   var xmlhttp = window.ActiveXObject ? new ActiveXObject("MSXML2.XMLHTTP") : new XMLHttpRequest; 
   xmlhttp.Open('POST', u, false); 
   xmlhttp.send(v); 
   return xmlhttp.responseText;
}

function PostAsync(u, v, wb, wait_to, cbo, ab_to) { 
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
}

/* Example:  xpath(xml_doc object or xml string, xpath_expression, separator) 
returns separator delimited string of results 
*/ 
function xpath(doc, q) { 
  var ret = new Array();
  xmlDoc = new ActiveXObject("Microsoft.XMLDOM"); 
  doc.match("<") ? xmlDoc.loadXML(doc) : xmlDoc.load(doc); 
  var n = xmlDoc.documentElement.selectNodes(q); 
  for (var i = 1; n.length > i ; i++) { 
    ret.push(n[i].text); 
  } 
  xmlDoc = null; 
  return ret; 
} 

/**************** Event Triggering ********************/ 

/* Example:  clickById(elementid);  */
function clickById(b) { 
  return document.getElementById(b).click(); 
}

/*************** Conversion functions *****************/ 

/* Example:  CSL2XML(csv string);  */
function CSV2XML(s) { 
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
  return ret; 
} 

/* Example:  xslTransform(xml url or string, stylesheet url or string);  */
function xslTransform(doc, stylesheet) { 
  try{ 
    xmlDoc = new ActiveXObject("Microsoft.XMLDOM"); 
    xslDoc = new ActiveXObject("Microsoft.XMLDOM"); 
    doc.match("<") ? xmlDoc.loadXML(doc) : xmlDoc.load(doc); 
    stylesheet.match("<") ? xslDoc.loadXML(stylesheet) : xslDoc.load(stylesheet); 
    var ret = xmlDoc.transformNode(xslDoc); 
    xmlDoc = null; 
    xslDoc = null; 
  return ret; 
  } catch (e) { 
    alert("Error XSL Transform: " + e); 
  } 
} 

/* Example:  XML2JSON(xml url or string, stylesheet url or string);  */
function XML2JSON(s) { 
	if(s.match("http")) s = Get(s);
    var json = ""; 
    var curval = ""; 
    var rec = "rec"; 
    for (var i=0;i<=s.length-1;i++) { 
    if ((current = s.charAt(i)) == '<') { 
      while ((current = s.charAt(++i)) != '>') t += current; 
        json == "" ? json += "{\""+t+"\": [ " : void(0); 
        if(!t.match("/")) { 
          stack.push(t); 
          if(rec == t) json += "{"; 
        } else { 
          var e = stack.pop(); 
          if(t.match("/"+e)) { 
            json = (removeLastChar(json)); 
            json += "},\r\n"; 
          } else { 
            stack.push(e); 
          } 
        } 
        t = ""; 
     } else { 
        curval += current; 
        while ((current = s.charAt(++i)) != '<') curval += current; 
        json += dblQuote(stack.pop()) + ":" + dblQuote(curval) + ", "; 
        curval = ""; 
        i--; 
        } 
    } 
    json = removeLastChar(json); 
    json += "]\r\n}"; 
    return json; 
} 

/**************  String handling help *****************/ 

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

/* Example:  removeLastChar("Chris");  == Chri */
function removeLastChar(s) { 
  return s.substring(0, s.length-2); 
} 

/* Example:  removeFirstChar("Chris");  == hris */
function removeFirstChar(s) { 
  return s.substring(1, s.length); 
} 

/* Example "http://www.yahoo.com".getTags(tag_name); 
   Gets tags and text within. 
*/ 
String.prototype.getTags = function(s) { 
  var val = String(this.valueOf()); 
  var r = new RegExp("<"+s+">(.*)</"+s+">","g"); 
  var match; 
  var a = new Array(); 
  while (match = r.exec(val)) { 
    a.push(match[0]); 
  } 
  return a; 
} 

/* Example str.getLines();  Returns array of lines. */ 
String.prototype.getLines = function(s) { 
  var val = String(this.valueOf()); 
  var r = new RegExp("(.*)","g"); 
  var match; 
  var a = new Array(); 
  while (match = r.exec(val)) { 
    var mm = match[0];
	if(mm.length > 1) {
	  a.push(mm); 
    }
  } 
  return a; 
}

/* Example "http://www.yahoo.com".replaceTags(tag_name, replacement); 
   Replaces tag names. 
*/ 
String.prototype.replaceTags = function(o, n) { 
  var val = String(this.valueOf()); 
  var r = new RegExp("<"+o+">","g"); 
  val = val.replace(r,"<"+n+">"); 
  var r = new RegExp("</"+o+">","g"); 
  val = val.replace(r,"</"+n+">"); 
  return val; 
} 

/* Example: a = "<tag>value</tag>".getTagText("tag");  a[0] = "value" 
   returns array of tag values
*/

String.prototype.getTagText = function(t) {  
  var ret = new Array();
  var rx = new RegExp(""+"<"+t+">(.*)<"+t+">", "g");
  var match;
  while (match = rx.exec(this.valueOf()))  ret.push(match[1]);
  return ret; 
} 

/*  Example: "dddddefghi".trimUntil("e"); returns "efghi" */
String.prototype.trimUntil = function(s) { 
  return this.valueOf().substring(this.valueOf().indexOf(s)); 
} 

/*  Example: getInnerText("chris", "c", "i" ; returns "hr" */
function getInnerText(s, begintext, endtext) { 
  var ret = new Array(); 
  var r = new RegExp(""+begintext+"(.*)"+endtext,"g"); 
  var match;
  while (match = r.exec(s)) ret.push(match[1]); 
  return ret; 
} 


/*********** Spin (converting to Javascript object) ********/ 

/*  Example: var obj = Spin(xml string);  */
function Spin(s) { 
  if(s.charAt(0) == "<") s = XML2JSON(s); 
  return eval("("+s+")"); 
} 

/*  Example: var obj = "<xml...".Spin();  */
String.prototype.Spin = function() { return Spin(this.valueOf()); } 

/*  Example: "xmlstring".selectXpath("/item");  returns array  */
String.prototype.SelectXpath = function(q) { 
  var val = String(this.valueOf()); 
  if (val.match("http:")) val = Get(val);
  return xpath(val, q);
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

/********************   UI    ***********************/ 

function CursorWait() { document.body.style.cursor = "wait" }
function CursorNormal() { document.body.style.cursor = "" }
function CursorMove() { document.body.style.cursor = "move" }

/*  Example:  AddElement([form, button, textarea, div, a, img, input, script], 
				optional x, y, width, height
				optional id) */
function AddElement(args) {
	if(!$d.body) InitializeUI();
	var e = $d.body.appendChild($d.createElement(arguments[0]));
    if(arguments.length > 1) 
		SetBounds(e, arguments[1],arguments[2],arguments[3],arguments[4]);
	if(arguments[5]) e.id = arguments[5];
	return e;
}

//function InitializeUI() {
//  var e = $d.createElement("BODY");
//}

function Remove(e) {
 if(e) {
  if (!e.toString().startsWith("[object")) e = document.getElementById(e);
  if (e != null && e.parentNode != null) e.parentNode.removeChild(e);
 }
}

/*   Example: PositionOnTop(topelement, bottomelement); */
function PositionOnTop(t, b) { 
  if (!t.toString().startsWith("[object")) t = document.getElementById(t);
  if (!b.toString().startsWith("[object")) b = document.getElementById(b);
 // vt.style.position = "absolute"; 
 // vt.style.left = vb.style.left; 
  t.style.top = parseInt(b.style.top) - 20; 
} 

/*   Example: PositionRelativeTo(topelement, bottomelement, offsetx, offsety); */
function PositionRelativeTo(t, b, x, y) { 
if (!t.toString().startsWith("[object")) t = document.getElementById(t);
if (!b.toString().startsWith("[object")) b = document.getElementById(b);
t.style.position = "absolute"; 
t.style.left = parseInt(b.style.left) + x; 
t.style.top = parseInt(b.style.top) + y; 
} 

/*   Example: Position(element obj or id, x pos, y pos); */
function Position(e, x, y) { 
  // startsWith needed for Firefox compatibility, element toString evals differently than IE
  if (!e.toString().startsWith("[object")) e = document.getElementById(e); 
  e.style.position = "absolute"; 
  e.style.left = (typeof x == 'string') ? parseInt(x) : x; 
  e.style.top = (typeof y == 'string') ? parseInt(y) : y;  
  return e;
} 

/*   Example: Size(element obj or id, width, height); */
function Size(e, w, h) { 
  if (!e.toString().startsWith("[object")) e = document.getElementById(e); 
  e.style.width = (typeof w == 'string') ? parseInt(w) : w; 
  e.style.height = (typeof h == 'string') ? parseInt(h) : h;  
  return e;
} 
  
function SetBounds(element, x, y, width, height) {
  Size(element, width,height);
  return Position(element, x,y);
}

/*   Example: showPosition(e);  Shows element x, y position*/
function showPosition(e) { 
  if (!e.toString().startsWith("[object")) e = document.getElementById(e); 
  return ""+e.style.left+", "+e.style.top; 
} 

/*   Example: Hide(element obj or id);  */
function Hide(e) {
  if (!e.toString().startsWith("[object")) e = document.getElementById(e); 
  e.style.visibility = "hidden";
  return e; 
}

/*   Example: Show(element obj or id);  */
function Show(e) {
  e['style']['visibility'] ? e.style.visibility = "" : e.style.visibility = "";
}

function ToggleVisible(e) {
  e['style']['visibility'] && e['style']['visibility'] == "hidden" ? Show(e) : Hide(e);
}

/*   Example: getSeleected();  Gets selected text on page. */
function GetSelected() { 
  if (document.selection) return document.selection.createRange().text; 
  if (window.getSelection) return window.getSelection; 
  if (document.getSelection) return document.getSelection; 
} 


/*****************   Controls   **********************/ 

function ContextMenu() {
  if(Visible_ContextMenu) Remove(Visible_ContextMenu);

  var e = AddElement('div');
  e.id = "_cm";
  SetBounds(e, event.clientX, event.clientY, 50, 132);
  e.style.backgroundColor = "#dbdbdb";
//  var ch = AddElement("img");
//  ch.src = "contmenu.png";
//  e.appendChild(ch);
//  Position(ch, 0,5);
  e.numitems = 0;
  function addItem(t, func) {
	var menuitem = $d.createElement('div');
	menuitem.style.backgroundColor = '#dbdbdb';
	menuitem.style.fontFamily = 'tahoma';
	menuitem.style.fontSize = '8pt';

    var l = e.appendChild(menuitem);
    SetBounds(l, 22,e.numitems * 22,120,22);
	l.innerHTML = t;
	l.onmouseover = function() { 
	  l.style.backgroundColor = "#000080";
	  l.style.color = "#ffffff";
    }
    l.onmouseout = function() { 
	  l.style.backgroundColor = "#dbdbdb";
	  l.style.color = "#000000";
    }
	l.oncontextmenu = function() { 
	  return false;
    }
	if(func) l.onclick = Function(func);
	e.numitems++;
  }
    addItem("Open", "alert('open');");
    addItem("Save");
    addItem("Next");
    addItem("Soup");
    addItem("View Element Source", "alert(_curr.outerHTML)");
    addItem("View Page Source", "alert(getSource())");
  e.oncontextmenu = function() {return false;}

  return e;
}

/*   Example: var pb = new progressBar(); pb.set(10); values 0-100 */
function progressBar(n, x) {
  var pb = AddElement("div");
  Size(pb, 140,10)
  this.color = "green";
  pb.style.borderTop = "1px inset black";
  pb.style.borderRight = "1px inset black";
  pb.style.borderBottom = "1px inset black";
  pb.style.borderLeft = "1px inset black";
  pb.set = function(ns) {
    this.val = ns;
    this.style.borderLeft = (ns * 1.4)+"px inset black";
	return this;
  }
  return pb;
}

function splashScreen(simg, timeout, postfunc) {
  var ssi = addElement("img", "splash");
  ssi.src = simg;
  Position(ssi, 270,220);
  var timeid = setTimeout("remove("+ssi.id+");"+postfunc, timeout);
  return ssi;
}


// undepressed_func is optional
function hoverButton(title, img, hoverimg, clickimg, onclick_func, undepressed_func) {
    var e = childElement("img","src="+img)
	e.title = title;
	e.onmouseover = function() { this.src = hoverimg; }
	e.onmouseout = function() { this.src = img; }
	e.onmousedown = function() { this.src = clickimg; }
	e.onmouseup = function() { this.src = img; }
	e.onclick = function() { eval(onclick_func) }
	if(undepressed_func) {
	  e.onclick = function() { 
		if("pressed" in e) {
		  eval(undepressed_func);
		  	e.onmouseover = function() { this.src = hoverimg; }
			e.onmouseout = function() { this.src = img; }
			e.onmousedown = function() { this.src = clickimg; }
			e.onmouseup = function() { this.src = img; }
		} else {
		  e.src = clickimg;
		  e.onmouseout = function() { this.src = clickimg; }
		  e.onmouseover = function() { this.src = clickimg; }
		  e.onmouseup = function() { this.src = clickimg; }
		  e.onmousedown = function() { this.src = clickimg; }
		  eval(onclick_func);
		}
		toggleAttribute(e, "pressed");
	  }
	}
	return e;
}

/*********** Other help ************************/ 

/*   Example: logError(err);  Placeholder for advanced error handling. */
function logError(s) { 
  if (confirm("Error: "+s+"\r\nCan we log this information to assist in debugging?\r\nThe only data kept is the error and browser type.  We do not collect personal data.")) { 
    alert("ok"); 
  } else { 
    alert("No information will be logged."); 
  } 
} 

/*   Example:  inspect(obj);  Show all properties of object */
function inspect(obj) { 
  var ret = ""; 
  for (x in obj) ret += x + ": " + obj[x] + ";"; 
  return ret; 
} 

function toggleAttribute(e, a) {
  if(e) {
   (a in e) ? e.removeAttribute(a) : e[a] = "y";
  }
}

function walkDOM(e, ret) {
  ret += e.id;
  for(c in e.childNodes) walkDOM(c, ret);
  return ret;
}

/*   Example:  is.ie;  returns true */
var Is = { 
  ie:      navigator.appName == 'Microsoft Internet Explorer', 
  java:    navigator.javaEnabled(), 
  ns:      navigator.appName == 'Netscape', 
  ua:      navigator.userAgent.toUpperCase(), 
  version: parseFloat(navigator.appVersion.substr(21)) || 
           parseFloat(navigator.appVersion), 
  win:     navigator.platform == 'Win32' 
} 

/*   Example:  isObject(o);  returns true if an object. */
function isObject(e) {  
  return !!e.toString().startsWith("[object"); 
}

function Pipeline() {
   return '60601';
}

// Intended to be UI independent
//Event_ContextMenu = function(event) {
//   GetEvent();
//   ContextMenu();
   //return false;
//}
//Event_OnMouseDown = function(event) {
//	alert(inspect(event));
//}
//

// For browser UI
//function GetEvent(event) { 
  // Cross browser event handler
//  var e;
//  window.event ? e = window.event.srcElement : e = event.target;
//  return e;
//}
Visible_ContextMenu = null;

document.oncontextmenu = function(event) {
  Visible_ContextMenu = ContextMenu();
  return false;
}

document.onclick = function(event) {
	Remove(Visible_ContextMenu);
}

//

/*
document.onmousedown = function (event) { 
  /*
    window.event ? e = window.event.srcElement : e = event.target;
	curr = e;
	if("isHandleable" in e) {

	  var ct = curr.style.top ? parseInt(curr.style.top) : 30;
	  var cl = curr.style.left ? parseInt(curr.style.left) : 30;
	  Position(phandle, cl,ct );
	  var ch = curr.style.height ? parseInt(curr.style.height) : 30;
	  var cw = curr.style.width ? parseInt(curr.style.width) : 30;
	  Size(phandle, cw, ch);
	  Show(phandle);
	  	}

}
document.onmouseup = function () { 
	/*
   if(e) {
    if(snapToGrid) {

     var l = parseInt(e.style.left);
	 var t = parseInt(e.style.top);
     e.style.left = l - (l % 20); 
     e.style.top = t - (t % 20);

	}
	e = null;
   }
	 e = null;
}
document.onmousemove = function(event) {
  if(window.event) event = window.event; // IE uses window.event
  if(e && "isDragable" in e && "style" in e) { 
    var xx = 20;
    phandle.style.left = event.clientX - xx;
    phandle.style.top = event.clientY - 20; 
	if(curr) {
	  curr.style.left = event.clientX-100;
      curr.style.top = event.clientY-100;
	}
	var ba;
	if(ba = Get("editbox_"+e.id)) {
       ba.style.left = e.style.left;
	   ba.style.top = parseInt(e.style.top)+24;
	}
	status = "left: "+e.style.left+"  top: "+e.style.top+"  offsetX: "+event.offsetX+" offsetY: "+event.offsetY;
  }
}
document.ondblclick = function(event) { 
  var src;
  // IE uses window.event, Firefox uses event.target
  window.event ? src = window.event.srcElement : src = event.target;
  if("isEditBox" in src) {
    closeEditBox(src);
  } else {    // Editable element 
     if(("isEditable" in src || src.tagName == "BODY") && !("isBeingEdited" in src)) {
	   var eb = editBox(src);
	   Position(eb, phandle.style.top,100);

	 }
  }
 }

document.body.onkeypress = function(e) {
  if (event.keyCode == "127" && curr)  {
    alert(curr.outerHTML);
  }
  if (event.keyCode == "10")  {
    walkDOM(document.body,"");
  }
  //if(Get("toolbar") == null) makeToolbar();
}

document.body.onselectstart = function() { return false; }
*/

/*
function test(s, $out) { 
  try
	{
	  alert(getFunctions());
	  /*
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
         } 
	} catch(e) {
	  $out("Error evaluating: " & m[1]);
	}
    return ret;
} 

//  SELF TESTING SCRIPT 
$(test(document.scripts[0].outerHTML));
*/

//</script>

/*
function showDocElements(id) { 
  for(i = 0; i < document.all.length; i++){ 
    if(document.all(i).tagName == "BODY") { 
    for(j = 0; j < document.all(i).childNodes.length; j++){ 
      if(arguments.length == 0) {
        alert(inspect(document.all(i).childNodes[j])); 
      } else {
        alert(inspect((document.all(i).childNodes[j]),id));
      }
    } 
    }  
  } 
  */