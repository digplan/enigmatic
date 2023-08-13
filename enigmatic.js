const w = {}, d = document
w.enigmatic = { version: '2023-07-29 0.21.2' }

window.onerror = (err, l, n) => {
  document.write(`<h2 style="border:8px solid Tomato;">${[l, 'line: ' + n, err].join('<br>')}</h2>`)
}

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

w.e = (name, fn = {}, style = {}) => {
  console.log(`registering component ${name}`)
  customElements.define(name, class extends HTMLElement {
    connectedCallback() {
      Object.assign(this.style, style)
      Object.assign(this, fn)
      Object.keys(fn).filter(k=>k.match(/click/)).forEach(k=>{
        this.addEventListener(k, fn[k], true)
      })
      if(this.init) this.init(this)
    }
  })
}

w.state = new Proxy({}, {
  set: async (obj, prop, value) => {
    await w.ready()
    console.log('state change:', prop, value)
    if (this[prop] === value) {
      return true
    }
    for (const e of $$(`[data=${prop}]`)) {
      if (e.set) e.set(value)
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

w.stream = async (url, key) => {
  const ev = new EventSource(url)
  ev.onmessage = (ev) => {
    const data = JSON.parse(ev.data)
    if (key) w.state[key] = data
    return data
  }
}

w.flatten = (obj, text) => {
  if (obj instanceof Array)
    return obj.map(o => w.flatten(o, text)).join('')
  const m = text.match(/{([^}]*)}/gm) || []
  for (const txt of m) {
    let val = JSON.parse(JSON.stringify(obj))
    for (let k of txt.replaceAll(/{|}/g, '').split('.')) {
      val = val[k]
    }
    text = text.replaceAll(txt, val)
  }
  return text
}

if (!window.components) window.components = {
  "data-view": {
    async init() {
      let ignore = this.innerHTML.match(/<!--IGNORE-->.*>/gms) || ''
      if (!ignore) {
        this.template = this.innerHTML
      } else {
        this.ignoreblock = ignore
        this.template = this.innerHTML.replace(ignore, '')
      }
      this.fetch()
    },
    set(o) {
      console.log('setting', o)
      const f = this.getAttribute('t')
      if (f) o = eval(f)(o)
      this.innerHTML = w.flatten(o, this.template)
      const target = this.getAttribute('data')
      if (target) w.state[target] = o
    },
    async fetch() {
      const u = this.getAttribute('fetch')
      if (u.startsWith('[') || u.startsWith('{'))
        return this.set(JSON.parse(u))
      const opts = {}
      const f = await fetch(u, opts)
      console.log(f)
      if (!f.ok) throw Error(`Could not fetch ${u}`)
      let data = await f.json()
      const tf = this.getAttribute('t')
      if (tf) data = eval(tf)(data)
      this.set(data)
    }
  }
}
for (let name in window.components) w.e(name, window.components[name], window.components[name]?.style)
Object.assign(window, w);

(async () => {
  await w.ready()
})()
