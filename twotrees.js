<script>

alert(document.scripts[0].outerHTML.split(/\s/g));


  a$ = '=|<|>|/|\|*|,|(|)|break|continue|delete|do|while|export|for|in|function|if|else|import|return|switch|case|default|var|while|with|new';
  b = a$.split('|');
  tree = new Object();
  w = new Object();
  numnodes = 0;

  for(i in b) {
    w = tree;
	for(var p = 0;p<b[i].length;p++) {
		c = b[i].charAt(p);
		if(!w[c]) {
		  w[c] = new Object();
		  numnodes++;
		}
		w = w[c];
	}
	    w['|'] = new Object();
  }
  
  /*
  teststr = 'var d = 0;'

  var test = teststr.Chars();
  ww = tree;
  var trace = '';

  for(i in test) {
	 var c = test[i];
	 if(c.match(/\s/)) {
	   alert(trace + ' WS ');
	   trace = '';
	 } else if (ww[c]) { 
	   alert(c); 
	   ww = ww[c];
	 } else if (c == '|') {
	   alert('END - PUSH');
	   ww = tree;
	 } else {
       trace += c;
	 }
  }
*/

</script>