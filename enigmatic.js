window.enigmatic = async x => {
  window.controls = window.controls || {}
  window.controls.helloworld = e=>e.innerHTML='Hello World!'
  window.$ = document.querySelectorAll.bind(document)
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
  }
  window.data = new Proxy({}, {
    set: (target, property, value, receiver) => {
      let arr = $(`[data=${property}]`)
      if(!arr) return;
      arr.forEach(e => {
         if(e.set) e.set(value); else e.innerHTML = value
      });
    }
  })
          
  let controls = $('[control]')
  for(let i=0; i<controls.length; i++){
    let e = controls[i]
    let name = e.getAttribute('control') || e.tagName.toLowerCase()
    e.css = (rules, sel)=>{
     var style = document.createElement("style")
     document.head.appendChild(style)
     style.sheet.insertRule(`${sel||name} { ${rules} }`)
    }
    await window.controls[name](e)
  }
  let dataurl = $('meta[data]')[0];
  if(dataurl){
    let d = await (await fetch(dataurl.getAttribute('data'))).json()
    for(k in d) data[k] = d[k]
  }
}
if(typeof enigmatic !== 'undefined')
  document.addEventListener("DOMContentLoaded", enigmatic);
