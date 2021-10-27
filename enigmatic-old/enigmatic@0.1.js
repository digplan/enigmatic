window.enigmatic = {'version' : '0.1'}

window.$ = document.querySelector.bind(document)
window.$$ = document.querySelectorAll.bind(document)

window.loadJSON = async (url) => {
  return new Promise(async r => {
    const req = await fetch(url)
    const newData = await req.json()
    for(k in newData) data[k] = newData[k]
    r(newData)
  })
}

window.data = new Proxy({}, {
    set: (obj, prop, value) => {
      console.log(`.data setting ${prop} to ${value}`);
      obj[prop] = value
      $$(`[x-datakey^=${prop}]`).forEach(control => {
         control.set ? control.set(value) : control.innerHTML = value
      })
      return prop
    }
})

window.enigmatic.start = async (x) => {

  $$('[x-control').forEach(async (e) => {
    e.child = (type) => e.appendChild(window.document.createElement(type||'div'))
    e.css = (rules) => {
      if(typeof rules == 'object')
        rules.forEach(()=>e.classList.add(a))
      document.styleSheets[0].insertRule(`#${e.id} {${rules}}`)
    }

    var tag = e.getAttribute('x-control');
    console.log('exec '+tag)
    if(tag in window.controls)
      await window.controls[tag](e)
    e.classList.forEach(async (name) => {
      if(window.classes[name])
        await window.classes[name](e)
    })
  })

  $$('meta[data]').forEach((m) => loadData(m.getAttribute('data')))
  $$('meta[stream]').forEach((m) => {
    let eventSource = new EventSource("/stream");
    eventSource.onmessage = (event) => {
      let obj = JSON.parse(event.data)
      let key = Object.keys(obj)[0];
      window.data[key] = obj[key];
    }
  })
  
  console.log(enigmatic)

}

window.controls = {}

controls.helloworld = (e) => {
  e.innerHTML = 'Hello World!'
  e.set = name =>
    e.innerHTML = `Hello ${name}`
}

controls.view = e => {
    e.show = () => {
      $$('view').forEach(v => {
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

window.classes = window.classes || {}

classes.print = (e) => {
  e.addEventListener('click', x => print())
  e.css('cursor:default')
}

document.addEventListener('DOMContentLoaded', window.enigmatic.start)