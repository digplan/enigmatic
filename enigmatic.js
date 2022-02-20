window.onerror = function (msg, url, line) {
  const s = "Error: " + msg + "\nURL: " + url + "\nLine: " + line
  document.write(`<div style='color:red; display:fixed'>${s}</div>`)
}

const w = window, d = document
w.$ = d.querySelector.bind(d)
w.$$ = d.querySelectorAll.bind(d)

w.loadJS = (src) => {
  return new Promise((r, j) => {
    if ($(`script[src="${src}"]`)) return r(true);
    const s = d.createElement('script');
    s.src = src;
    s.addEventListener('load', r);
    d.head.appendChild(s);
  });
};

w.loadCSS = (src) => {
  return new Promise((r, j) => {
    const s = document.createElement('link');
    s.rel = 'stylesheet';
    s.href = src;
    s.addEventListener('load', r);
    d.head.appendChild(s);
  });
};

w.wait = (ms) => new Promise((r) => setTimeout(r, ms));

w.state = new Proxy(
  {},
  {
    set: (obj, prop, value) => {
      //prop = prop.toLowerCase()
      debug && console.log('Updating app state', "'", prop, "'", value)
      for (const e of $$(`[data*=${prop}]`)) {
        console.log('setting e', e)
        if(!e.set) {
          e.set = new Function('o', 'return this.innerHTML = `' + e.innerHTML.replaceAll('{', '${o.') + '`')
          console.log('defaulting set', e.set)
        }
        e.set(value)
      }
      obj[prop] = value
      return value
    },
    get: (obj, prop, receiver) => {
      if (prop == '_state') return obj
      return obj[prop]
    }
  }
);

w.ready = async () => {
  return new Promise((r) => {
    if (document.readyState === 'complete') r(true);
    document.onreadystatechange = () => {
      if (document.readyState === 'complete') r();
    };
  });
};

w.customElement = (name, { props, style, template = '', onMount, beforeData }) => {
  customElements.define(name, class extends HTMLElement {
    async connectedCallback() {
      this.props = [...this.attributes].reduce((p, c) => {p[c.name] = c.value; return p}, {})
      if(beforeData) this.beforeData = beforeData
      this.template = template || this.innerHTML
      if(template) this.innerHTML = ''
      if(this.props.fetch || this.props.stream) this.setAttribute('data', this.tagName)
      this.setf = new Function('o', 'return `' + template.replaceAll('{', '${o.') + '`')
      if (onMount) onMount(this)
      if (this.props.immediate !== null && this.props.fetch) this.fetch()
      if (this.props.immediate !== null && this.props.stream) this.stream()
      console.log(this.innerHTML = this.template)
    }
    stream(url, options) {
      debug && console.log('Streaming', this.tagName, this.props.stream)
      const ev = new EventSource(url)
      ev.onmessage = (e) => {
        const data = JSON.parse(e.data)
        if (this.beforeData) {
          this.beforeData(data)
          debug && console.log('After transform', data)
        }
        state[this.tagName] = data
      }
    }
    async fetch(url, options) {
      if(!this.props.fetch) return
      const json = await(await fetch(this.props.fetch, options)).json()
      state[this.tagName] = json
    }
    set(data) {
      //if (!Array.isArray(data)) data = [data]
      //data[arr].forEach((i) => {
      debug && console.log('Setting', this.tagName, this.beforeData)
      if(this.beforeData){
        this.beforeData(data)
        debug && console.log('After transform', data)
      }
        this.innerHTML += this.setf(data)
     // })
    }
  })
}

if(caches) w.vastcache = caches.open('vast')

w.defe = async e => {
  if(!e.id) throw `element ${e.tagName} has no id`
  if (!e.set) e.set = new Function('o', 'return this.innerHTML = `' + e.innerHTML.replaceAll('{', '${o.') + '`')
  if (!e.fetch) e.fetch = async x => state[e.id] = (await fetch(e.getAttribute('fetch'))).json()
  if (!e.stream) e.stream = x => {
    new EventSource(e.getAttribute('stream')).onmessage = data => state[e.id] = data
  }
  if (!e.fetchCache) e.fetchCache = async x => {
    let match = await vastcache.match(request)
    if(!match) {
      match = await fetch(e.getAttribute('fetchCache')).json()
      await vastcache.put(request, match)
    }
    state[e.id] = match
  }
}

w.decorate = x => {
  [...$$('*')].map(defe)
}

const start = async () => {
  w.debug = d.body.getAttribute('debug') !== null
  w.debug && console.log('Starting app')
  const Components = (await import('./components.mjs')).default
  Object.keys(Components).map(n=> w.customElement(n, Components[n]))
  await w.ready()
  if (w.main) w.main(d);
}

start()
