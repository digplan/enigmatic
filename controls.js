var controls = {

	ContextMenu : function() {
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
  		AddItem:  function(t, func) {
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
	},

	ProgressBar = function (n, x) {
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
	},

	SplashScreen = function(simg, timeout, postfunc) {
  		var ssi = addElement("img", "splash");
  		ssi.src = simg;
  		Position(ssi, 270,220);
  		var timeid = setTimeout("remove("+ssi.id+");"+postfunc, timeout);
  		return ssi;
	}


	// undepressed_func is optional
	HoverButton: function(title, img, hoverimg, clickimg, onclick_func, undepressed_func) {
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
		return e;
	}

}