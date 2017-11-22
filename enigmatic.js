enigmatic = async x => {
  window.helloworld = e => e.innerHTML = 'Hello World!'
  window.views = e => e.set = showid => $('views > view').forEach( v => v.hidden = v.id != showid )
  window.gmap = async e => {
    await load('http://maps.googleapis.com/maps/api/js?v=3')
    new google.maps.Map(e, {center: new google.maps.LatLng(30, -80)})
  }
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
      console.warn(s)
      document.body.appendChild(e)
      e.onload = r
    })
  }
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
          
  let controls = $('[control]')
  for(let i=0; i<controls.length; i++){
    let e = controls[i]
    let name = e.getAttribute('control') || e.tagName.toLowerCase()
    e.css = (rules, sel)=>{
     var style = document.createElement("style")
     document.head.appendChild(style)
     style.sheet.insertRule(`${sel||name} { ${rules} }`)
    }
    await window[name](e)
  }
  let dataurl = $('meta[data]')[0];
  if(dataurl){
    let d = await get(dataurl.getAttribute('data'))
    for(k in d) data[k] = d[k]
  }
}
enigmatic()
