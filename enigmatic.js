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
      debug && console.log('Updating app state', "'", prop, "'", value)
      for (const e of $$(`[data*=${prop}]`)) {
        const arr = e.getAttribute('data').split('.');
        arr.shift();
        for (const p of arr) value = value[p];
        e.set ? e.set(value) : (e.textContent = value);
      }
      obj[prop] = value
      debug && console.log(window.data)
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

w.customElement = (name, { props, style, template, onMount, beforeData }) => {
  customElements.define(name, class extends HTMLElement {
    async connectedCallback() {
      const p = [...this.attributes].reduce((p, c) => {p[c.name] = c.value; return p}, {})
      this.props = p
      if(p.fetch) this.setAttribute('data', this.tagName)
      this.template = template
      debug && console.log('Connected', this.tagName, p)
      if (onMount) onMount(p)
      debug && console.log('Mounted', this.tagName, p)
      if(p.immediate !== null && p.fetch) this.fetch()

    }
    stream(url, options) {
      debug && console.log('Streaming', this.tagName, this.props.fetch)
      const ev = new EventSource(url)
      ev.onmessage = (e) => {
        state[this.tagName] = JSON.parse(e.data)
      }
    }
    async fetch(url, options) {
      debug && console.log('Fetching', this.tagName, this.props.fetch)
      if(!this.props.fetch) return
      const json = await(await fetch(this.props.fetch, options)).json()
      state[this.tagName] = json
    }
    set(data) {
      //if (!Array.isArray(data)) data = [data]
      const f = new Function('o', 'return `' + this.template + '`')
      //data[arr].forEach((i) => {
      debug && console.log('Setting', this.tagName, this.template, data, f[data])
        this.innerHTML += f(data)
     // })
    }
  })
}

const start = async () => {
  w.debug = d.body.getAttribute('debug') !== null
  w.debug && console.log('Starting app')
  const Components = (await import('./components.mjs')).default
  Object.keys(Components).map(n=> {
    debug && console.log('Loading component', n, Components[n])
    w.customElement(n, Components[n])
  })
  await w.ready();
  if (w.main) w.main(d);
}

start()
