<script>
document.write("o");

// interfaces?

function Widget(o) {
  this._e = document.body.appendChild(document.createElement(o.type));

  this.setStyle = function(o) {
    for(i in o) this._e.style[i] = o[i];
	return this._e;
  }
  this.addElement = function(o) {
    return Widget(o.type);
  }
  return this;
}

var x = new Widget({type: 'DIV'});
x.setStyle({width:100, height:100, left:0, top:0, backgroundColor:'black'});

var child = x.addElement({type: 'DIV'});
alert(child.setStyle({width:30, height:30, left:0, top:0, backgroundColor:'white'}));

</script>
