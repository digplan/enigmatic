/*
    enigmatic v 0.11.0 front end js utils
    
    Usage:
    <div id='mykey' transform='func1' fetch='some.site/data' immediate>${name} ${value}</div>
    <div id='mykey2' transform='func2' stream='some.site/data'>${name} ${value}</div>

    $('selector')
    $$('selector')
    await loadJS('sounds.js')
    await loadCSS('enigmatic.css')
    await wait(1000)
    await ready()
    beep()
    element(beforeData=>beforeData.field, '<div>${o.mykey}</div>')
    window.components
    state
    await get
    await stream
*/

const w = {},
  d = document

/////// Helpers

w.$ = d.querySelector.bind(d)
w.$$ = d.querySelectorAll.bind(d)
w.loadJS = (src) => {
  return new Promise((r, j) => {
    if ($(`script[src="${src}"]`)) return r(true)
    const s = d.createElement('script')
    s.src = src
    s.addEventListener('load', r)
    d.head.appendChild(s)
  })
}
w.loadCSS = (src) => {
  return new Promise((r, j) => {
    const s = document.createElement('link')
    s.rel = 'stylesheet'
    s.href = src
    s.addEventListener('load', r)
    d.head.appendChild(s)
  })
}
w.wait = (ms) => new Promise((r) => setTimeout(r, ms))
w.ready = async () => {
  return new Promise((r) => {
    if (document.readyState === 'complete') r(true)
    document.onreadystatechange = () => {
      if (document.readyState === 'complete') r()
    }
  })
}

/////// Custom element

w.element = (
  name,
  { onMount = x => x, beforeData = (x) => x, style, template = '' }
) => {
  customElements.define(
    name,
    class extends HTMLElement {
      connectedCallback(props) {
        onMount(this)
        if (style) {
          const s = document.createElement('style')
          s.innerHTML = `${name} {${style}}`
          d.body.appendChild(s)
        }
        this.template = template
        if (!this.template.match('{')) this.innerHTML = this.template
      }
      set(o) {
        this.innerHTML = ''
        o = beforeData(o)
        if (!Array.isArray(o)) o = [o]
        const m = new Function('o', 'return `' + this.template + '`')
        o.map((i) => (this.innerHTML += m(i)))
        return true
      }
    }
  )
}

if (window.components) {
  for (let name in window.components) w.element(name, window.components[name])
}

/////// State, data, and reactivity

w.state = new Proxy({}, {
    set: (obj, prop, value) => {
      console.log(prop, value)
      if(this[prop] === value) {
        return true
      }
      for (const e of $$(`[data=${prop}]`)) {
        if(e.set) e.set(value)
      }
      obj[prop] = value
      return value
    },
    get: (obj, prop, receiver) => {
      if (prop == '_all') return obj
      return obj[prop]
    }
  }
)

w.get = async (
  url,
  options = null,
  transform = null,
  key = 'temp'
) => {
  let data = await (await fetch(`https://${url}`, options)).json()
  if (transform) data = transform(data)
  state[key] = data
  return data
}

w.stream = async (url, key) => {
  const ev = new EventSource(url)
  ev.onmessage = (ev) => {
    const data = JSON.parse(ev.data)
    w.state[key] = data
    return data
  }
}

/////// Startup

w.start = async () => {
  await w.ready();
  [...$$('*')].map(e => {
    e.attr = {};
    [...e.attributes].map((a) => (e.attr[a.name] = a.value))
    if (e.attr?.fetch) {
      e.fetch = async () => {
        return w.get(e.attr?.fetch, {}, w[e.attr?.transform], e.attr.data)
      }
    }
    if (e.hasAttribute('immediate')) {
      e.fetch()
    }
    if (e.attr?.stream) {
      e.stream = w.stream.bind(null, e.pr.stream, null, window[e.pr.transform], e.id)
    }
    let dta = e.attr?.data
    if (dta) {
      if(dta.endsWith('[]')) {
        dta = dta.replace('[]', '')
      }
      if (e.innerHTML && e.innerHTML.includes('{')) {
        e.template = e.innerHTML.replaceAll('{', '${')
        e.innerHTML = ''
      }
      e.set = (o) => {
        e.innerHTML = ''
        const template = e.template.replaceAll('{', '{rec.')
        if (!Array.isArray(o)) o = [o]
        const f = new Function('rec', 'return `' + template + '`')
        o.map(rec => {
            if(typeof rec !== 'object') rec = {value: rec}
            e.innerHTML += f(rec)
        })
      }
      if (e.attr?.value) {
        let o = e.attr.value
         try { o = JSON.parse(o) } catch(e) {} 
         w.state[dta] = o
      }
    }
  })
}

w.enigmatic = { version: '2022-09-24 0.11.1' }
Object.assign(window, w);

(async () => {
  await w.start()
})()
