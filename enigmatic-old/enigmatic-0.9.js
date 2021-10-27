
window.enigmatic = {'version' : '0.1'}

window.$ = document.querySelector.bind(document)
window.$$ = document.querySelectorAll.bind(document)

window.loadData = async (url) => {
  return new Promise(async r => {
    const req = await fetch(url)
    const data = await r.json()
    for(k in d) data[k] = d[k]
    r(data)
  })
}

window.data = new Proxy({}, {
    set: (obj, prop, value) => {
      obj[prop] = value
      $(`[data^=${prop}]`).forEach(control => {
         control.set ? control.set(value) : control.innerHTML = value
      })
      return prop
    }
})

window.controls = {}

controls.helloworld = (e) => {
  e.set = name =>
    e.innerHTML = `Hello ${name}`
}

controls.view = e => {
    e.show = () => {
      $('view').forEach(v => {
          v.classList.remove('show')
          v.classList.add('hide')
          v.classList.add('fixed')
      })
      e.classList.remove('gone')
      e.classList.remove('hide')
      e.classList.add('show')
    }
    if(!window.viewstate){
      e.show()
      window.viewstate = []
    }
}

controls.modal = e => {
  var modal = document.body.child('pre')
  modal.id = 'dataviewer'
  modal.classList.add('center-screen')
  modal.classList.add('arrow')

  modal.onclick = (ev) => {
    $('section').forEach((section)=>section.classList.remove('blur'))
    modal.classList.add('hide')
  }

  e.classList.add('arrow')
  e.onclick = (ev) => {
    modal.classList.remove('hide')
    $('section').forEach((section)=>section.classList.add('blur'))
    modal.innerHTML = eval(e.getAttribute('render'))
  }
}

controls.icon = async function(e){
  await load('https://fonts.googleapis.com/icon?family=Material+Icons', 'css')
  e.innerHTML = `<span class="material-icons">${e.getAttribute('kind')}</span>`    
}

controls.mapembed = e =>
  e.innerHTML = `<iframe frameborder=0 src="https://maps.google.com/maps?f=q&source=s_q&hl=en&geocode=&q=${e.getAttribute('where')||'Chicago'}&output=embed"></iframe>` 


window.classes = window.classes || {}

classes.print = (e) => {
  e.addEventListener('click', x => print())
  e.css('cursor:default')
}

window.enigmatic.start = async (x) => {

  $('*').forEach((e) => {
    const tag = e.tagName.toLowerCase()
    if(!e.id)
      e.id = Math.random().toString(36).substring(2, 15).replace(/\d/g, '')
    e.child = (type) => e.appendChild(window.document.createElement(type||'div'))
    e.css = (rules) => {
      if(typeof rules == 'object')
        rules.forEach(()=>e.classList.add(a))
      document.styleSheets[0].insertRule(`#${e.id} {${rules}}`)
    }
    if(tag in window.controls)
      await window.controls[tag](e)
    e.classList.forEach(async (name) => {
      if(window.classes[name])
        await window.classes[name](e)
    })
  })

  $$('meta[data]').forEach((m) => loadData(m.getAttribute('data')))

}

document.addEventListener('DOMContentLoaded', window.enigmatic.start)