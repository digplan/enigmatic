window.enigmatic_version = 'v0.10'
window.$ = document.querySelectorAll.bind(document)

export async function loadData (url) {
  return new Promise(async r => {
    const req = await fetch(url)
    const data = await r.json()
    for(k in d) data[k] = d[k]
    r(data)
  })
}

export function data () {
    return new Proxy({}, {
    set: (obj, prop, value) => {
      obj[prop] = value
      $(`[data^=${prop}]`).forEach(control => {
         control.set ? control.set(value) : control.innerHTML = value
      })
      return prop
    }
})
}

export async function start(x) {

  $('*').forEach((e) => {
    alert(helloworld)
    const tag = e.tagName.toLowerCase()
    console.log([tag, tag in window])
    if(!e.id)
      e.id = Math.random().toString(36).substring(2, 15).replace(/\d/g, '')
    e.child = (type) => e.appendChild(window.document.createElement(type||'div'))
    e.css = (rules) => {
      if(typeof rules == 'object')
        rules.forEach(()=>e.classList.add(a))
      document.styleSheets[0].insertRule(`#${e.id} {${rules}}`)
    }

    e.classList.forEach(async (name) => {
      if(window.classes[name])
        await window.classes[name](e)
    })
  })

  $('meta[data]').forEach((m) => loadData(m.getAttribute('data')))
  console.info(`enigmatic runtime v0.9 : ${new Date().toISOString()}`)

}

document.addEventListener('DOMContentLoaded', window.enigmatic)