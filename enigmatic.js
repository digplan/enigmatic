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

w.flattenMap = (obj, text) => {
  let template = ''
  if (text.match(/\$key|\$val/i)) {
    for (let k in obj) {
      template += text.replaceAll('{$key}', k).replaceAll('{$val}', obj[k])
    }
    return template
  }
  for (let k in obj) {
    text = text.replaceAll(`{${k}}`, obj[k])
  }
  return text
}

w.flatten = (obj, text) => {
  if (!(obj instanceof Array) && typeof Object.values(obj)[0] === 'string') {
    return w.flattenMap(obj, text)
  }
  let htmls = ''
  if (obj instanceof Array) obj = { ...obj }
  for (let k in obj) {
    let html = text.replaceAll('{$key}', k)
    for (let j in obj[k]) {
      const val = typeof obj[k] === 'object' ? obj[k][j] : obj[k]
      html = html.replaceAll('{_key_}', j).replaceAll('{$val}', val)
      html = html.replaceAll(`{${j}}`, val)
    }
    htmls += html
  }
  return htmls
}

w.e = (name, fn = {}, style = {}) => {
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

w.element = (
  name,
  { onMount = x => x, beforeData = (x) => x, style, template = '', fn = {} }
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
        Object.assign(this, fn)
      }
      set(o) {
        o = beforeData(o)
        this.innerHTML = w.flatten(o, this.template)
        return o
      }
    }
  )
}

if (window.components) {
  for (let name in window.components) w.e(name, window.components[name], window.components[name]?.style)
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

w.get = async (url, options = {}, transform, key) => {
  console.log(`fetching ${url}`)
  let data
  if (url.startsWith('{') || url.startsWith('[')) {
      data = JSON.parse(url)
  } else {
      let f = await fetch(url, options)
      if (!f.ok) throw Error(`Could not fetch ${url}`)
      data = await f.json()
  }
  if (transform) {
    console.log('transforming ' + data)
    data = transform(data)
  }
  if (key) w.state[key] = data
  return data
}

w.stream = async (url, key) => {
  const ev = new EventSource(url)
  ev.onmessage = (ev) => {
    const data = JSON.parse(ev.data)
    if (key) w.state[key] = data
    return data
  }
}

w.start = async () => {
  await w.ready();
  [...$$('*')].map(e => {
    e.attr = {};
    [...e.attributes].map((a) => (e.attr[a.name] = a.value))
    if (e.attr.fetch) {
      e.fetch = async () => {
        let template = e.innerHTML
        let ignore = template.match(/<!--IGNORE-->.*>/gms) || ''
        if(ignore)
          template = template.replace(ignore, '')
        const obj = await w.get(e.attr.fetch, {}, null, e.attr.data)
        e.innerHTML = w.flatten(obj, template) + ignore
        let pos = 0
        for(c in e.children) {
          const ele = e.children[c]
          if(typeof ele === 'object' && 'set' in ele)
            e.children[c].set(obj[pos++])
        }
        return obj
      }
      if (!e.hasAttribute('defer'))
        e.fetch()
    }
    if (e.attr?.stream) {
      e.stream = w.stream.bind(null, e.pr.stream, null, window[e.pr.transform], e.id)
    }
    let dta = e.attr?.data
    if (dta) {
      console.log(`reactive ${e} ${dta}`)
      if (!e.set) {
        if (e.innerHTML) {
          e.template = e.innerHTML
          if (e.innerHTML.match('{') && !e.attr.preserve) {
            e.innerHTML = ''
          }
        }
        e.set = (o) => {
          e.innerHTML = w.flatten(o, e.template) || o
        }
      }
      if (e.attr.value) {
        let o = e.attr.value
        try { o = JSON.parse(o) } catch (e) { }
        w.state[dta] = o
      }
    }
  })
}

Object.assign(window, w);

(async () => {
  await w.start()
})()
