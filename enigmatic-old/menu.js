function menu(p, e) {

  $('#'+p.bind).addEventListener("click", function(ev){e.hidden = false;ev.stopImmediatePropagation();});
  e.style.position  = 'relative'; e.style.left='-40px';

  if (p.items) {
    var z = p.items.split(',');
    for (i = 1; i < z.length; i++) {
      var c = p.func + '(' + z[i] + ')';
      var ch = e.child('<div style="font-family:arial;padding:9px;cursor:default;" onclick=\'' + c + '\'" onmouseout="this.style.backgroundColor=\'#ffffff\';this.style.color=\'#000000\'" onmouseover="this.style.backgroundColor=\'#777777\';this.style.color=\'#ffffff\'">' + z[i - 1] + '</div>');
      i++;
      ch.onclick = function() {
        this.parentElement.hidden = true
      }
    }
  }
  document.addEventListener('click', function(ev) {
    e.hidden = true;
  })
  return e;
}

function contextmenu(p, e) {
  var childmenu = menu(p, e);
  childmenu.hidden = true;

  document.addEventListener('mousemove', function(e) {
    window.cpos = [e.pageX, e.pageY];
  })
  document.oncontextmenu = function() {
    childmenu.style.position = 'absolute';
    childmenu.style.top = window.cpos[1] - 20 + 'px';
    childmenu.style.left = window.cpos[0] - 20 + 'px';
    childmenu.hidden = false;
    return false;
  }
}