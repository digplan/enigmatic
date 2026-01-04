const w = {}, d = document
w.enigmatic = { version: '2026-01-03 0.23.0' }

const showError = (err, source, line, col) => {
  const errorDiv = d.createElement('div')
  errorDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ff4444;color:white;padding:20px;z-index:10000;font-family:monospace;border-bottom:4px solid #cc0000;'
  errorDiv.innerHTML = `<strong>JavaScript Error:</strong><br>${err}<br><small>${source ? source + ':' : ''}${line ? ' line ' + line : ''}${col ? ':' + col : ''}</small>`
  d.body.insertBefore(errorDiv, d.body.firstChild)
}

window.onerror = (err, source, line, col) => {
  showError(err, source, line, col)
  return false
}

window.addEventListener('unhandledrejection', (e) => {
  showError(e.reason?.message || e.reason || 'Unhandled Promise Rejection', '', '', '')
})

w.$ = d.querySelector.bind(d)
w.$$ = d.querySelectorAll.bind(d)

w.loadJS = (src) => {
  return new Promise((r, j) => {
    if (w.$(`script[src="${src}"]`)) return r(true)
    const s = d.createElement('script')
    s.src = src
    s.addEventListener('load', r)
    s.addEventListener('error', j)
    d.head.appendChild(s)
  })
}

w.wait = (ms) => new Promise((r) => setTimeout(r, ms))

w.ready = async () => {
  return new Promise((r) => {
    if (document.readyState === 'complete') return r(true)
    document.addEventListener('readystatechange', () => {
      if (document.readyState === 'complete') r()
    })
  })
}

w.e = (name, fn = {}, style = {}) => {
  console.log(`registering component ${name}`)
  customElements.define(name, class extends HTMLElement {
    connectedCallback() {
      Object.assign(this.style, style)
      if (typeof fn === 'function') {
        this.set = (data) => {
          this.innerHTML = fn(data)
        }
      } else {
        Object.assign(this, fn)
        Object.keys(fn).filter(k=>k.match(/click|mouseover/)).forEach(k=>{
          this.addEventListener(k, fn[k], true)
        })
        if(this.init) this.init(this)
      }
    }
  })
}

w.state = new Proxy({}, {
  set: async (obj, prop, value) => {
    await w.ready()
    console.log('state change:', prop, value)
    if (obj[prop] === value) {
      return true
    }
    for (const e of w.$$(`[data="${prop}"]`)) {
      if (e.set) e.set(value)
    }
    obj[prop] = value
    return true
  },
  get: (obj, prop, receiver) => {
    if (prop == '_all') return obj
    return obj[prop]
  }
})

w.get = async (url, opts = {}, transform, key) => {
  const res = await fetch(url, opts)
  if (!res.ok) throw Error(`Could not fetch ${url}`)
  let data = await res.json()
  if (transform) data = transform(data)
  if (key) w.state[key] = data
  return data
}

w.stream = async (url, key) => {
  const ev = new EventSource(url)
  ev.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data)
      if (key) w.state[key] = data
      return data
    } catch (err) {
      showError(err.message || err, '', '', '')
    }
  }
  ev.onerror = (e) => {
    showError('EventSource error', '', '', '')
    ev.close()
  }
  return ev
}

w.flatten = (obj, text, context = {}) => {
  const hasSpecialVars = /{\$key}|{\$val}|{\$index}/.test(text)
  
  if (obj instanceof Array)
    return obj.map((o, i) => w.flatten(o, text, { ...context, $key: i, $index: i, $val: o })).join('')
  
  if (hasSpecialVars && obj && typeof obj === 'object' && !Array.isArray(obj))
    return Object.entries(obj).map(([k, v]) => w.flatten(v, text, { ...context, $key: k, $val: v })).join('')
  
  const m = text.match(/{([^}]*)}/gm) || []
  for (const txt of m) {
    const key = txt.replaceAll(/{|}/g, '')
    let val = context[key] !== undefined ? context[key] : undefined
    if (val === undefined && obj && typeof obj === 'object') {
      val = obj
      for (let k of key.split('.')) {
        val = val?.[k]
      }
    } else if (val === undefined) {
      val = obj
    }
    text = text.replaceAll(txt, val ?? '')
  }
  return text
}

const props = {
    async init() {
      let ignore = this.innerHTML.match(/<!--IGNORE-->.*?<!--ENDIGNORE-->/gms) || []
      if (!ignore.length) {
        this.template = this.innerHTML
      } else {
        this.ignoreblock = ignore
        this.template = this.innerHTML
        ignore.forEach(block => {
          this.template = this.template.replace(block, '')
        })
      }
      this.innerHTML = ''
      if (!this.hasAttribute('defer')) {
        this.fetch()
      }
    },
    set(o) {
      console.log('setting', this, this.template, o)
      this.innerHTML = w.flatten(o, this.template)
      const dt = this.getAttribute('data')
      if(dt)
        w.state[dt] = o
    },
    async fetch() {
      try {
        const u = this.getAttribute('fetch')
        if(!u) return
        if (u.startsWith('[') || u.startsWith('{'))
          return this.set(JSON.parse(u))
        const opts = {}
        const f = await fetch(u, opts)
        console.log(f)
        if (!f.ok) throw Error(`Could not fetch ${u}`)
        let data = await f.json()
        const tf = this.getAttribute('t')
        if (tf) {
          try {
            data = new Function('return ' + tf)()(data)
          } catch (err) {
            showError(`Transform error: ${err.message}`, '', '', '')
          }
        }
        this.set(data)
      } catch (err) {
        showError(err.message || err, '', '', '')
      }
    }
}

for (let name in window.components) 
  w.e(name, window.components[name], window.components[name]?.style)

Object.assign(window, w);

(async () => {
  try {
    await ready()
    for (const i of w.$$('div')) {
      Object.assign(i, props)
      i?.init()
    }
  } catch (err) {
    showError(err.message || err, '', '', '')
  }
})()
