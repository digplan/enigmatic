UI: {
	
	Init: function() { Pipeline.DocRef.body || Pipeline.DocRef.write("P") },

	CursorWait: function() { Pipeline.DocRef.body.style.cursor = "wait" },
	
	CursorNormal: function() { Pipeline.DocRef.body.style.cursor = "" },
	
	CursorMove: function() { Pipeline.DocRef.body.style.cursor = "move" },

	// Call with x,y,w,h,id
	AddElement: function(e) {
		var ee = document.body.appendChild(document.createElement(e.type);
    		return SetBounds(ee, e);
	},

	SetBounds: function(e, x,y,w,h) {
		return Pipeline.UI.Size(Pipeline.UI.Position(e,x,y), w, h);
	},

	Position: function(e, x, y) { 
  		// startsWith needed for Firefox compatibility
  		if(typeof e == 'string') e = document.getElementById(e); 
  		e.style.position = "absolute";
  		e.style.left = x; // parseInt if string?
  		e.style.top = y;  
  		return e;
	}, 

	Size: function(e, w, h) { 
		e.toString().startsWith("[object") || e = document.getElementById(e); 
		e.style.width = parseInt(w)  || w; 
		e.style.height = parseInt(h) || h;  
		return e;
	},

	Remove: function(e) {
		e || return null;
 		e.toString().startsWith("[object") || e = document.getElementById(e);
		e.parentNode == null || e.parentNode.removeChild(e);
	},

	Hide: function(e) {
		e.toString().startsWith("[object") || e = document.getElementById(e);
		e.style.visibility = 'hidden';
		return e;
	},

	Show: function(e) {
		!e || !e.style.visibility || e.style.visibility = '';
	}, 

	PreloadImage: function(name, url, h, w) {
		var p = new Image(h, w) || new Image();
  		p.src = url;
		Pipeline.Data.Cache[name] = p;
		return p;
	},

	WalkDOM: function(e, ret) {
  		ret += e.id;
  		for(c in e.childNodes) walkDOM(c, ret);
  		return ret;
	},

	GetCrossBrowserEvent: function GetEvent(event) { 
		var e;
		window.event ? e = window.event.srcElement : e = event.target;
		return e;
	},

	NoSelectionAllowed: function() { document.body.onselectstart = function() { return false; } },


	/* Example:  clickById(elementid);  */
	ClickById: function(b) { 
  		return document.getElementById(b).click(); 
	},


	/*   Example: PositionOnTop(topelement, bottomelement); */
	PositionOnTop: function(t, b) { 
  		if (!t.toString().startsWith("[object")) t = document.getElementById(t);
  		if (!b.toString().startsWith("[object")) b = document.getElementById(b);
 		// vt.style.position = "absolute"; 
 		// vt.style.left = vb.style.left; 
  		t.style.top = parseInt(b.style.top) - 20; 
	},

	/*   Example: PositionRelativeTo(topelement, bottomelement, offsetx, offsety); */
	PositionRelativeTo: function(t, b, x, y) { 
		if (!t.toString().startsWith("[object")) t = document.getElementById(t);
		if (!b.toString().startsWith("[object")) b = document.getElementById(b);
		t.style.position = "absolute"; 
		t.style.left = parseInt(b.style.left) + x; 
		t.style.top = parseInt(b.style.top) + y; 
	}, 

	/*   Example: Position(element obj or id, x pos, y pos); */
	Position: function(e, x, y) { 
  		// startsWith needed for Firefox compatibility, element toString evals differently than IE
 		 if (!e.toString().startsWith("[object")) e = document.getElementById(e); 
  		e.style.position = "absolute"; 
  		e.style.left = (typeof x == 'string') ? parseInt(x) : x; 
  		e.style.top = (typeof y == 'string') ? parseInt(y) : y;  
  		return e;
	}, 

	/*   Example: Size(element obj or id, width, height); */
	Size: function(e, w, h) { 
		if (!e.toString().startsWith("[object")) e = document.getElementById(e); 
  		e.style.width = (typeof w == 'string') ? parseInt(w) : w; 
  		e.style.height = (typeof h == 'string') ? parseInt(h) : h;  
  		return e;
	},
  
	SetBounds: function(element, x, y, width, height) {
		Size(element, width,height);
  		return Position(element, x,y);
	},

	/*   Example: getSeleected();  Gets selected text on page. */
	GetSelected: function() { 
  		if (document.selection) return document.selection.createRange().text; 
  		if (window.getSelection) return window.getSelection; 
  		if (document.getSelection) return document.getSelection; 
	} 

	/*   Example: showPosition(e);  Shows element x, y position*/
	ShowPosition:function(e) { 
  		if (!e.toString().startsWith("[object")) e = document.getElementById(e); 
  		return ""+e.style.left+", "+e.style.top; 
	},



d.onmouseover = function() {this.style.borderStyle = 'outset'}
d.onmouseout = function() {this.style.borderStyle = ''}
d.onmouseup = function() {this.style.borderStyle = ''}
d.onmousedown = function() {this.style.borderStyle = 'inset'}
}