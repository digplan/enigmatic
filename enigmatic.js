enigmatic = async x => {
<<<<<<< HEAD
    try {
      window.helloworld = e =>
        e.innerHTML = 'Hello World!'
      window.views = e =>
       e.set = showid =>
        $('views > view').forEach( v => v.hidden = v.id != showid )
     
      window.load = s => {
       return new Promise(r => {
         var iscss = s.match(/css$/);
         if(!iscss){
           for(i=0;i<document.scripts.length;i++)
             if(document.scripts[i].src == s) return r()
         }
         var e = document.createElement(iscss ? 'link' : 'script')
         if(iscss) e.rel = "stylesheet";
         e[iscss ? 'href' : 'src'] = s; 
         document.body.appendChild(e)
         e.onload = x => {
           console.log(s); r(s);
         }
       })
=======
 try {
   window.helloworld = e =>
     e.innerHTML = 'Hello World!'
   window.views = e =>
    e.set = showid =>
     $('views > view').forEach( v => v.hidden = v.id != showid )
  
   window.load = s => {
    return new Promise(r => {
      var iscss = s.match(/css$/);
      if(!iscss){
        for(i=0;i<document.scripts.length;i++)
          if(document.scripts[i].src == s) return r()
      }
      var e = document.createElement(iscss ? 'link' : 'script')
      if(iscss) e.rel = "stylesheet";
      e[iscss ? 'href' : 'src'] = s; 
      document.body.appendChild(e)
      e.onload = x => {
        console.log(s); r(s);
>>>>>>> cc2998ef92e56ae9d917768befdba0c44b0752f5
      }
      window.$ = document.querySelectorAll.bind(document);
      window.data = new Proxy({}, {
       set: (target, property, value, receiver) => {
         var arr = $(`[data=${property}]`)
         if(arr){
           arr.forEach(e => {
            console.log(`set data ${e.tagName} ${JSON.stringify(value)}`);
            if(e.set) e.set(value);
           });
         }
         target[property] = value;
       }
      });
      $('[control]').forEach(e => {
       console.log(e) 
       var ename = e.tagName.toLowerCase();
       var cn = e.getAttribute('control');
       if(cn) ename = cn;
       e.css = (rules, sel)=>{
         var style = document.createElement("style");
         document.head.appendChild(style);
         style.sheet.insertRule(`${sel||e.tagName} { ${rules} }`); 
       }
       await window[ename](e)
      }); 
      window.get = async url => {
        var res = await fetch(url)
        var d = await res.json()
        return d;      
      }
<<<<<<< HEAD
      (async () => {
         var dataurl = $('meta[data]')[0];
         if(dataurl){
           var d = await get(dataurl.getAttribute('data'))
           for(k in d) data[k] = d[k]
         }
      })()
      console.log('enigmatic runtime')
    } catch(e) {
      document.write(e.stack)
    }  
   }
=======
      target[property] = value;
    }
   });
   $('[control]').forEach(e => {
    console.log(e) 
    var ename = e.tagName.toLowerCase();
    var cn = e.getAttribute('control');
    if(cn) ename = cn;
    e.css = (rules, sel)=>{
      var style = document.createElement("style");
      document.head.appendChild(style);
      style.sheet.insertRule(`${sel||e.tagName} { ${rules} }`); 
    }
    await window[ename](e)
   }); 
   window.get = async url => {
     var res = await fetch(url)
     var d = await res.json()
     return d;      
   }
   (async () => {
      var dataurl = $('meta[data]')[0];
      if(dataurl){
        var d = await get(dataurl.getAttribute('data'))
        for(k in d) data[k] = d[k]
      }
   })()
   console.log('enigmatic runtime')
 } catch(e) {
   document.write(e.stack)
 }  
}
>>>>>>> cc2998ef92e56ae9d917768befdba0c44b0752f5
