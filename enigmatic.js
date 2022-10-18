const w = {}, d = document
w.enigmatic = { version: '2022-09-24 0.11.2' }

window.onerror = (err, l, n) => {
  document.write(`<h2 style="border:8px solid Tomato;">${[l, 'line: ' + n, err].join('<br>')}</h2>`)
}

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

// Template a string, using {$key}, {_key_}, {_val_}
// ie.. {key1: {name: 'value'}, key2: {name: 'value2'}} OR [{name: 'value'}, {name: 'value2'}]
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
        o = beforeData(o)
        this.innerHTML = w.flatten(o, this.template)
        return o
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

w.save = (obj, name) => {
  return localStorage.setItem(name, JSON.stringify(obj))
}

w.load = (name) => {
  return localStorage.getItem(name)
}

w.get = async (url, options = {}, transform, key) => {
  let data = await (await fetch(`https://${url}`, options)).json()
  if (transform) data = transform(data)
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

/////// Startup
w.start = async () => {
  await w.ready();
  [...$$('*')].map(e => {
    e.attr = {};
    [...e.attributes].map((a) => (e.attr[a.name] = a.value))
    if (e.attr.fetch) {
      e.fetch = async () => {
        console.log(`fetching ${e.attr.fetch}`)
        return w.get(e.attr.fetch, {}, w[e.attr.transform], e.attr.data)
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
      console.log(`processing ${e}`)
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
