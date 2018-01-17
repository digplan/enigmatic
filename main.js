window.enigmatic = async x => {
  window.controls = window.controls || {}
  window.controls.helloworld = e=>e.innerHTML='Hello World!'
  window.$ = document.querySelectorAll.bind(document)
  window.load = s => {
    return new Promise(r => {
      var iscss = s.match(/css$/);
      if(!iscss){
        for(var i=0;i<document.scripts.length;i++)
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
    set: (obj, prop, value) => {
      console.warn('data.' + prop + ' = ' + JSON.stringify(value))
      obj[prop] = value
      const controls = $(`[data^=${prop}]`)
      if(!controls.length) return console.warn('did not find controls for ' + `[data^=${prop}]`)
      console.warn('found controls ' + controls)
      controls.forEach(control => {
         var cval = value
         control.getAttribute('data').split('.').forEach(p=>{
           if(p == prop) return
           cval = cval[p]
         })
         console.warn(control + ' ' + control.getAttribute('data') + ' = ' + cval)
         if(control.set) control.set(cval); else control.innerHTML = cval
      })
    }
  })
  Element.child = (type, parent) => {
    const e = document.createElement(type||'div')
    (parent||this).appendChild(e)
  }
  let controls = $('[control]')
  for(let i=0; i<controls.length; i++){
    let e = controls[i]
    let name = e.getAttribute('control') || e.tagName.toLowerCase()
    e.css = (rules, sel)=>{
     var style = document.createElement("style")
     document.head.appendChild(style)
     style.sheet.insertRule(`${sel||name} { ${rules} }`)
    }
    if(name in window.controls)
      await window.controls[name](e)
  }
  let dataurl = $('meta[data]')[0];
  if(dataurl){
    let d = await (await fetch(dataurl.getAttribute('data'))).json()
    for(k in d) data[k] = d[k]
  }
  console.warn(+new Date())
}
window.enigmatic.version = 'v0.8.1'
document.addEventListener('DOMContentLoaded', window.enigmatic)
