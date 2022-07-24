/*
    enigmatic v 0.11.0 front end js utils
    
    Usage:
    <div id='mykey' transform='func' fetch='some.site/data' immediate>${name} ${value}</div>
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
  { beforeData = (x) => x, style, template = '' }
) => {
  customElements.define(
    name,
    class extends HTMLElement {
      connectedCallback(props) {
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

w.state = (key, data) => {
  if (!key && !data)
    return localStorage.clear()
  if (data) {
    const stored_data = { when: new Date().toISOString(), data: data }
    localStorage.setItem(key, JSON.stringify(stored_data))
    for (const e of $$(`[data*=${key}]`)) e.set(stored_data.data)
    return stored_data
  }
  return JSON.parse(localStorage.getItem(key))
}

w.get = async (
  url,
  options = null,
  transform = null,
  key = 'temp'
) => {
  let data = await (await fetch(`https://${url}`, options)).json()
  if (transform) data = transform(data)
  state.set(key, data)
  return data
}

w.stream = async (url, key) => {
  const ev = new EventSource(url)
  ev.onmessage = (ev) => {
    const data = JSON.parse(ev.data)
    state(key, data)
    return data
  }
}

/////// Startup

w.start = async () => {
  await w.ready();
  [...$$('div')].map((e) => {
    if (!e.id)
      e.id = Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, '')
        .substr(0, 3)
    e.pr = {};
    [...e.attributes].map((a) => (e.pr[a.name] = a.value))
    if (e.pr.fetch) e.fetch = w.get.bind(null, e.pr.fetch, null, window[e.pr.transform], e.id)
    if ('immediate' in e.pr) e.fetch()
    if (e.pr.stream) e.stream = w.stream.bind(null, e.pr.stream, null, window[e.pr.transform], e.id)
    if (e.pr.data) {
      if (e.innerHTML && e.innerHTML.includes('{')) {
        e.template = e.innerHTML.replaceAll('{', '${')
        e.innerHTML = ''
      }
      e.set = (o) => {
        e.innerHTML = ''
        if (!Array.isArray(o)) o = [o]
        const m = new Function('o', 'return `' + e.template + '`')
        o.map((i) => (e.innerHTML += m(i)))
      }
    }
  })
}

w.enigmatic = { version: '2022-07-24 0.11.0' }
Object.assign(window, w);

(async () => {
  await w.start()
})()
