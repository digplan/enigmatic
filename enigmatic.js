enigmatic = async x => {
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
         if(iscss) e.rel = "stylesheet"
         e[iscss ? 'href' : 'src'] = s
         document.body.appendChild(e)
         e.onload = r
       })
      window.$ = document.querySelectorAll.bind(document)
      window.data = new Proxy({}, {
       set: (target, property, value, receiver) => {
         var arr = $(`[data=${property}]`)
         if(arr){
           arr.forEach(e => {
            console.warn(`set data ${e.tagName} ${JSON.stringify(value)}`)
            if(e.set) e.set(value)
           });
         }
         target[property] = value
       }
      })

      let e = $('[control]')
      for(let i=0; i<e.length; i++){
       console.warn(e)
       let name = e.getAttribute('control') || e.tagName.toLowerCase()
       e.css = (rules, sel)=>{
         var style = document.createElement("style")
         document.head.appendChild(style)
         style.sheet.insertRule(`${sel||name} { ${rules} }`)
       }
       await window[name](e)
      }

      (async () => {
         let dataurl = $('meta[data]')[0];
         if(dataurl){
           let d = await get(dataurl.getAttribute('data'))
           for(k in d) data[k] = d[k]
         }
      })()
      console.warn('enigmatic runtime')
    } catch(e) {
      document.write(e.stack)
    } 
   }
  }