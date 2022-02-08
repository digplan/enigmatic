<script src="pipeline.js"></script>
<script>

// VER 60602

//d = Function;
//a = alert;
//l = new d("","a('Hi')");
//l();

var username, snapToGrid, e;
var curr;
var enumber = 0;
var enum2 = 0;
var DIVProperties = "id;style.font;style.width;style.height;style.backgroundImage;style.backgroundRepeat;style.backgroundColor;style.border;style.borderRight;style.zIndex;innerHTML";
var IMGProperties = "style.font;style.width;style.height;style.border;style.zIndex;src";
var INPUTProperties = "style.font;style.width;style.height;value";
var TEXTAREAProperties = "outerHTML;style.font;style.width;style.height;value";
var BODYProperties = "style.backgroundColor;style.backgroundImage;style.backgroundRepeat;style.border";
var BUTTONProperties = "style.backgroundColor;value;onclick";
var FORMProperties = "name;action;method";

document.write("<img id='bg' src=logo_bg.png />");  // Necessary to write something to open the document
document.body.style.backgroundColor = "#e5e5e5";
Position("bg", 420, 220);

splashScreen("dp_notext.png",1500);
var t = toolbar();
Hide(t);


function splashScreen(simg, timeout) {
  var ssi = AddElement("IMG",270,220,200,200,'current_ss');
  ssi.src = simg;
  var timeid = setTimeout("remove(current_ss); loginDialog();", timeout);
  return ssi;
}

function getSource() {
  var ret = "";
  var e = document.all;
  for(var c=0;c<e.length;c++) {
	if(e[c].id.substr(0,3) == "ele") { // persist element
	    //alert(e[c].tagName);
		ret += "AddElement('" + 
		e[c].outerHTML.match(/<([^\s]*)/)[1] + 
		"', " + 
		e[c].offsetTop + ", " +
		e[c].offsetLeft + ", " +
		e[c].clientHeight + ", " +
		e[c].clientWidth + ");\n";
	}
  }
  alert(ret);
  //Puts(ret,"d:\\TEST.UI");
}

function preview() {
  var ps = clean(getSource(), "NewPage");
  var w = window.open('','','toolbar=no,width=400,height=400,resize=yes');
  w.document.open();
  w.document.write(ps);
  w.document.close();
  return w;
}

function remove(e) {
  if (e != null && e.parentNode != null) {
    e.parentNode.removeChild(e);
	if(document.getElementById("_"+e.id))      document.getElementById("_"+e.id).parentNode.removeChild(document.getElementById("_"+e.id));
  }
}
/*
function addFormToEditor() {
  var ap = addForm("ele_form_"+enumber++,"New Form");
  ap.name = "Form1";
  ap.innerHTML = ap.name;
  Position(ap,50,120);
}

function addButtonToEditor() {
  var ap = addButton("ele"+enumber++,"New Button");
  Position(ap,200,200);
    ap.isDragable = "yes";
  ap.isEditable = "yes";
}
function addPanelToEditor() {
  var ap = addPanel("ele"+enumber++,"New Panel");
  Position(ap,200,200);
  ap.style.font = "normal 10pt Verdana";
    ap.isDragable = "yes";
  ap.isEditable = "yes";
  return ap;
}
function addImageToEditor() {
  var ap = addImage("ele"+enumber++,"");
  ap.isDragable = "yes";
  ap.isEditable = "yes";
  Position(ap,200,200);
  return ap;
}
function addTextAreaToEditor() {
  var ap = addTextArea("ele"+enumber++,"");
  Position(ap,200,200);
    ap.isDragable = "yes";
  ap.isEditable = "yes";
}
function addInputToEditor() {
  var ap = addInput("ele"+enumber++,"");
  Position(ap,200,200);
    ap.isDragable = "yes";
  ap.isEditable = "yes";
}
function addPasswordBoxToEditor() {
    var ap = addInput("ele"+enumber++,"");
    Position(ap,200,200);
	    ap.isDragable = "yes";
  ap.isEditable = "yes";
	//awful kludge
	ap.outerHTML = ap.outerHTML.replace("id","type=password id");
	  ap.isDragable = "yes";
  ap.isEditable = "yes";
  
}
function addHTMLToEditor() {
  var ap = addTextArea("ele"+enumber++,"");
  ap.ondblclick = function() { 
    var ne = document.createElement("DIV");
	ne.isDragable = "yes";
	ne.isEditable = "yes";
	ne.style.top = "100";
    ne.style.left = "100";
    ne.innerHTML = this.value;
    document.body.appendChild(ne);
	remove(this);
  }
}
*/
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
} 

function saveDialog() { 
  if (!username) { alert("You must login with a username and password to save files.  Press the login button on the toolbar.");return;  }
  addComponent("SaveDialog.htm"); }
function loginDialog() { addComponent("LoginDialog.htm"); }
function deleteDialog() { 
    if (!username) { alert("You must login with a username and password to delete files.  Press the login button on the toolbar.");return;  }
     if(document.getElementById('lb')) { remove(lb); return; }
     addComponent("Deletebox.htm"); 
     var xmlhttp = window.ActiveXObject ? new ActiveXObject("MSXML2.XMLHTTP") : new XMLHttpRequest; 
     xmlhttp.Open('POST', 'http://www.jspipeline.com/g.php', false);
     var sd = "email="+username; 
     //alert(sd);
	 xmlhttp.send(sd);
	 var resp = xmlhttp.responseText;
	 if(resp != "") {
	   var fns = resp.split(";");
	   for(var i = 1;i<9;i++) eval("lb"+i+".innerHTML = fns["+(i-1)+"]");
	   lb1.innerHTML = fns[0];
     } else {
     }  
}
function deleteFileFromServer(fn) {
     var xmlhttp = window.ActiveXObject ? new ActiveXObject("MSXML2.XMLHTTP") : new XMLHttpRequest; 
     xmlhttp.Open('POST', 'http://www.jspipeline.com/d.php', false);
     var sd = "email="+username+";name="+fn;
	 xmlhttp.send(sd);
	 var resp = xmlhttp.responseText;
	 alert(fn +" has been deleted");
	 remove(lb);
	 deleteDialog();
}

function openDialog() { 
  if (!username) { alert("You must login with a username and password to open files.  Press the login button on the toolbar.");return;  }
  if(document.getElementById('lb')) { remove(lb); return; }
  addComponent("listbox.htm"); 
     var xmlhttp = window.ActiveXObject ? new ActiveXObject("MSXML2.XMLHTTP") : new XMLHttpRequest; 
     xmlhttp.Open('POST', 'http://www.jspipeline.com/g.php', false);
     var sd = "email="+username; 
     //alert(sd);
	 xmlhttp.send(sd);
	 var resp = xmlhttp.responseText;
	 if(resp != "") {
	   var fns = resp.split(";");
	   for(var i = 1;i<9;i++) eval("lb"+i+".innerHTML = fns["+(i-1)+"]");
	   lb1.innerHTML = fns[0];
     } else {
     }  
}

function getFileFromServer(fn) {
     var xmlhttp = window.ActiveXObject ? new ActiveXObject("MSXML2.XMLHTTP") : new XMLHttpRequest; 
     xmlhttp.Open('POST', 'http://www.jspipeline.com/o.php', false);
     var sd = "email="+username+";name="+fn;
	 xmlhttp.send(sd);
	 var resp = xmlhttp.responseText;
	   var pgs = resp.split(";;;;;");
	   for(var i=0;i<pgs.length-1;i++) {
         var ct = unescape(pgs[i].replace(";;;;;",""));
	     addComponent(ct);
	   }
}

function addComponent(fn) {
  var ne = AddElement('DIV');
  var xx = "./"+fn;
  ne.innerHTML = Get(xx);
  //alert(ne.innerHTML);
  //if(ne.innerHTML == "")  return null;
  //document.body.appendChild(ne);
  return ne;
}

function saveLocal(name) {
  var ret = getSource();
  var w = window.open('','','toolbar=no,width=400,height=400,resize=yes');
  w.document.open();
  w.document.write("<DIV id='"+name+"' >"+ret+"</DIV>");
  w.document.execCommand('SaveAs', '1', name+".html");
  w.close();
}
function openfile(filename) {
   var newfile = Get("./"+filename);
   if (newfile == "") alert("None found");
   document.body.insertAdjacentHTML("beforeEnd", newfile);
}

function clean(fn, par) {
  return fn;
/*
  var t = fn;
  t = t.replace(/isEdit.*\".*\"/g, "");
  t = t.replace(/isDrag.*\".*\"/g, "");
  t = t.replace(/\r|\n/g,"");
  t = t.replace(/id=([^\'\"].*)\s/g, "id='$1"+"'");
  t = t.replace(/id=\'(.*)[\s|\']/g, "id='"+par+".$1"+"'");
  t = "<DIV id='"+par+"' >"+t+"</DIV>";
  return t;
*/
}

function saveRemote(pgname) {
     var xmlhttp = window.ActiveXObject ? new ActiveXObject("MSXML2.XMLHTTP") : new XMLHttpRequest; 
     xmlhttp.Open('POST', 'http://www.jspipeline.com/s.php', false);
	 //alert(getSource());
	 //alert(escape(getSource()));
	 var ps = clean(getSource(), pgname);
     alert(ps);

     var sd = "email="+username+";name="+pgname+";content="+escape(); 
     //alert(sd);
	 xmlhttp.send(sd);
	 var resp = unescape(xmlhttp.responseText);
	 if(resp.startsWith("success")) {
	   alert("Saved "+pgname);
	   remove(SaveDialog);
     } else {
       alert("Could not save.");
	   remove(SaveDialog);
     }
}

function doLogin(u, p) {
  var xmlhttp = window.ActiveXObject ? new ActiveXObject("MSXML2.XMLHTTP") : new XMLHttpRequest; 
   xmlhttp.Open('POST', 'http://www.jspipeline.com/l.php', false);
   xmlhttp.send("email="+u+";pw="+p); 
   if(xmlhttp.responseText.match("success")) {
     username = u;
	 remove(LoginDialog);
	 Show(t);
   } else {
     ele9.innerHTML = "<b>Incorrect Password</b>. Try again, or you may proceed by clicking Cancel.";
	 ele9.style.width = 280;
	 ele9.style.color = "red";
   }
}

function closeEditBox(src) {
  if(src.parentElement.id == "_") { // editor for body element
      var targ = document.body;
  } else {
	  var targ = document.getElementById(src.parentElement.id.substring(1));
  }

	  var props = src.parentElement.all;
	  for(var i=0;i<props.length;i++) {
		var pn = props[i].propertyName;
		var pv = props[i].value;
		if(pn != "undefined" && pn != null) {
		   if(pn.indexOf(".") != -1) {
		      pn = pn.split(".");
			  if(pn[1] == "backgroundImage" && pv.indexOf("url(") == -1) pv = "url("+pv+")";
	          var ev = "targ."+pn[0]+"['"+pn[1]+"'] = \""+pv+"\"";
			  //alert(ev);
			  try {
			  eval(ev);
			  } catch(err) {
			  continue;
			  }
	       } else {
	          var ev = "targ['"+pn+"'] = \""+pv+"\"";
			  try {
			  eval(ev);
			  } catch(err) {
			  continue;
			  }
	       }
		}
	  }
	  if(targ.tagName == "FORM") targ.innerHTML = targ.name;
      targ.isBeingEdited = null;
	  document.body.removeChild(src.parentElement);
}

function toolbar() {
  var nt = new control("toolbar", 240, 29, 450, 80);
  nt.id = "_toolbar";
  nt.style.zIndex = "100";
  nt.isDragable = "yes";
    enumber++;
    var i = nt.add("toolbar_pnl","img", "Add Panel", 24, 24, "src=toolbar_pnl1.png;");
     applyImgMouseEvents(i,"AddElement('DIV',100,100,50,30).id = 'ele"+enumber+"'");
	var i = nt.add("toolbar_img","img", "Add Image", 24, 24, "src=toolbar_img1.png;");
      applyImgMouseEvents(i,"AddElement('IMG',100,100,50,30).id = 'ele"+enumber+"'");
	var i = nt.add("toolbar_inp","img", "Add Input", 24, 24, "src=toolbar_inp1.png;");
      applyImgMouseEvents(i,"AddElement('INPUT',100,100,50,30).id = 'ele"+enumber+"'");
	var i = nt.add("toolbar_ta","img", "Add TextArea", 24, 24, "src=toolbar_ta1.png;");
      applyImgMouseEvents(i,"AddElement('TEXTAREA',100,100,50,30).id = 'ele"+enumber+"'");
	var i = nt.add("toolbar_pwd","img", "Add Password Box", 24, 24, "src=toolbar_pwd1.png;");
     applyImgMouseEvents(i,"addPasswordBoxToEditor()");
	var i = nt.add("toolbar_btn","img", "Add Button", 24, 24, "src=toolbar_btn1.png;");
     applyImgMouseEvents(i,"AddElement('BUTTON',100,100,50,30).id = 'ele"+enumber+"'");
	var i = nt.add("toolbar_frm","img", "Add Form", 24, 24, "src=toolbar_frm1.png;");
     applyImgMouseEvents(i,"addFormToEditor()");
	var i = nt.add("toolbar_frm","img", "Add HTML", 24, 24, "src=toolbar_frm1.png;");
     applyImgMouseEvents(i,"addHTMLToEditor()");
	var i = nt.add("toolbar_exp","img", "Preview", 24, 24, "src=toolbar_exp1.png;");
     applyImgMouseEvents(i,"preview()");
	 	 var i = nt.add("toolbar_ope","img", "Open", 24, 24, "src=toolbar_ope1.png;");
     applyImgMouseEvents(i,"openDialog()");
	var i = nt.add("toolbar_sav","img", "Save", 24, 24, "src=toolbar_sav1.png;");
     applyImgMouseEvents(i,"saveDialog()");
	 var i = nt.add("toolbar_del","img", "Delete", 24, 24, "src=toolbar_ope1.png;");
     applyImgMouseEvents(i,"deleteDialog()");
	var i = nt.add("toolbar_stg","img", "Snap to grid", 24, 24, "src=toolbar_stg1.png;");
     applyImgMouseEvents(i,"toggleSnapToGrid()");
	var i = nt.add("toolbar_sg","img", "Show grid", 24, 24, "src=toolbar_sg1.png;");
     applyImgMouseEvents(i,"document.body.style.backgroundImage == \"\" ? document.body.style.backgroundImage = \"url(line.png)\":document.body.style.backgroundImage = \"\"; ");
	var i = nt.add("toolbar_td","img", "Toggle draggable", 24, 24, "src=toolbar_td1.png;");
     applyImgMouseEvents(i,"toggleDragable(curr)");
    var i = nt.add("toolbar_te","img", "Toggle editable", 24, 24, "src=toolbar_te1.png;");
     applyImgMouseEvents(i,"toggleEditable(curr)");
	var i = nt.add("toolbar_log","img", "Logoff/Logon", 24, 24, "src=toolbar_log.png;");
     applyImgMouseEvents(i,"loginDialog()");
	var i = nt.add("toolbar_del","img", "Delete item", 24, 24, "src=toolbar_del1.png;");
     applyImgMouseEvents(i,"remove(curr)");

function applyImgMouseEvents(i, onclick_func) {
	//i.onmousedown = function() { this.src = this.id+"1.png" }
	i.onmouseover = function() { this.src = this.id+"2.png" }
	i.onmouseout = function() { this.src = this.id+"1.png" }
	i.onmousedown = function() { this.src = this.id+"3.png" }
	i.onmouseup = function() { this.src = this.id+"1.png" }
	i.onclick = function() { eval(onclick_func) }
}
	 return nt;
}

function toggleSnapToGrid() {
  if(!snapToGrid || snapToGrid == null) {
     snapToGrid = "1";
	 document.getElementById('toolbar_stg').onmouseup = "toolbar_stg3.png";
	 document.getElementById('toolbar_stg').onmouseout = "toolbar_stg3.png";
	 document.getElementById('toolbar_stg').onmouseover = "toolbar_stg3.png";
	 document.getElementById('toolbar_stg').onmousedown = "toolbar_stg3.png";
     document.getElementById('toolbar_stg').src = "toolbar_stg3.png";
	} else {
     snapToGrid = null;
	 applyImgMouseEvents(document.getElementById('toolbar_stg'),"toggleSnapToGrid()");
	}
}

function toggleDragable(e) {
  ("isDragable" in e) ? e.removeAttribute("isDragable") : e.isEditable = "yes";
}

function toggleEditable(e) {
  ("isEditable" in e) ? e.removeAttribute("isEditable") : e.isEditable = "yes";
}

function control(id, sizex, sizey, posx, posy) {
  var newt = AddElement('DIV',posx,posy,sizex,sizey,id);
  //newt.id = id;
  //Size(newt, sizex, sizey);
  //Position(newt, posx, posy);
  //newt.style.backgroundImage = "url(bar.png)";
  //newt.style.position = "absolute";
  newt.style.backgroundColor = "#e0e0e0";
  //document.body.appendChild(newt);
  newt.add = function(id, typetag, title, sizex, sizey, atts) {
    var newc = document.createElement(typetag); 
	newc.id = id;
	newc.controlid = this.id+"_"+id;
	newc.title = title;
	if(sizex != "-1" && sizey != "-1") Size(newc, sizex, sizey);
    var ats = atts.split(";");
	for(var i=0;i<ats.length-1;i++) {
		var sp = ats[i].split("=");
		newc[sp[0]] = sp[1];
	}
	newt.appendChild(newc);
    return newc;
  }
  return newt;
}

function editBox(src) {
  var newd = document.createElement("div");
  var x = document.body.appendChild(newd);
  newd.id = "_"+src.id;
  Size(newd,400,200);

  var tagName = src.tagName;
  if(tagName == "HTML") tagName = "BODY";  // trick Firefox to IE convention
  // Position editbox if not editing document element
  if(tagName != "BODY")
    Position(newd,parseInt(src.style.left),parseInt(src.style.top)+24);
  
  newd.style.font = "normal 8pt Verdana";

  var a = eval(tagName+"Properties").split(";");
  for(var c=0;c<a.length;c++) {
	var s = a[c].split(":");
	newd.innerHTML = newd.innerHTML + s[0];
	var inp = document.createElement("INPUT");
	inp.id = "_"+newd.id+"_"+s[0];
	inp.propertyName = s[0];
	inp.isEditBox = "yes";
	inp.style.font = "normal 8pt Verdana";
	if(s[0].indexOf(".") != -1) {
	 inp.value = eval("src."+s[0]);
	} else {
	 inp.value = src[s[0]];
	}
	newd.appendChild(inp);
	newd.innerHTML = newd.innerHTML + "<br/>";
    }

 // newd.style.backgroundColor = "#dbdbdb";
  src.isBeingEdited = "1";
  return newd;

}

document.onmousedown = function (event) { 
    window.event ? e = window.event.srcElement : e = event.target;
	if(e.isDragable == "yes") {
	   curr = e;
	} else { 
	   e = null;
	}
}
document.onmouseup = function () { 
   if(e) {
    if(snapToGrid) {
     var l = parseInt(e.style.left);
	 var t = parseInt(e.style.top);
     e.style.left = l - (l % 20); 
     e.style.top = t - (t % 20); 
	}
	e = null;
   }
}
document.onmousemove = function(event) {
  if(window.event) event = window.event; // IE uses window.event
  if(e) { 
    e.style.left = event.clientX - 50; 
    e.style.top = event.clientY - 20; 
	status = "left: "+e.style.left+"  top: "+e.style.top;
	if(document.getElementById("_"+e.id)) {
	  document.getElementById("_"+e.id).style.left = e.style.left;
      document.getElementById("_"+e.id).style.top = parseInt(e.style.top)+24;
	}
  }
}
document.ondblclick = function(event) { 
  var src;
  // IE uses window.event, Firefox uses event.target
  window.event ? src = window.event.srcElement : src = event.target;
  if("isEditBox" in src) {
    closeEditBox(src);
  } else {    // Editable element 
     if("isEditable" in src || src.tagName == "BODY") var eb = editBox(src);
  }
 }


</script>