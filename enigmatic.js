const w = window, d = document;

w.$ = d.querySelector.bind(d);
w.$$ = d.querySelectorAll.bind(d);

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

w.ready = async () => {
  return new Promise((r) => {
    if (document.readyState === 'complete') r(true);
    document.onreadystatechange = () => {
      if (document.readyState === 'complete') r();
    };
  });
};

class EnigmaticElement extends HTMLElement {
  showHideClasses = ['show', 'hide']
  constructor() {
    super()
  }
  async connectedCallback() {
    const props = {}, attrs = this.attributes;
    [...attrs].forEach((attr) => {
      props[attr.name] = attr.value
    })
    if(this.render) this.render(props)
  }
  async showHide(s = 1, h = 0) {
    return new Promise(r => {
      if (s === 1) this.hidden = false
      this.classList.remove(this.showHideClasses[h])
      this.classList.add(this.showHideClasses[s])
      for (const child of this.children) {
        child.classList.remove(this.showHideClasses[s])
        child.classList.add(this.showHideClasses[h])
      }
      r(true)
    })
  }
  async show() {
    return this.showHide()
  }
  async hide() {
    return this.showHide(0, 1)
  }
  async toggle() {
    this.classList.contains(this.showHideClasses[0]) ? await this.hide() : await this.show()
  }
  set(s) {
    if (typeof s === 'object') {
      s = JSON.stringify(s)
    }
    this.innerHTML = s
  }
  child(type = 'e-e', id = Math.random()) {
    const child = document.createElement(type)
    child.id = id
    this.appendChild(child)
    return child
  }
  childHTML(html, type = 'e-e', id = Math.random()) {
    const e = this.child(type, id)
    e.innerHTML = html
    return e
  }
}

w.element = (s) => {
  let [name, html] = s[0].split(', ')
  customElements.define(name, class extends HTMLElement {
    connectedCallback(props) {
      html = html.replaceAll('{', '${')
      this.template = html
      if(!html.match(/\$\{/)) this.innerHTML = html
    }
    set(o) {
      const m = new Function('o', 'return `' + this.template + '`')
      this.innerHTML = m(o)
    }
  })
}

const oldmain = async () => {
  await w.ready();
  w.body = d.body;
  body.child = (type = 'div', id = Math.random()) => {
    const child = d.createElement(type);
    if (id) child.id = id;
    body.appendChild(child);
    return child;
  };
  if (w.main) w.main(d);
}

w.state = new Proxy(
  {},
  {
    set: (obj, prop, value) => {
      for (const e of es(`[data*=${prop}]`)) {
        console.log('setting e', e.tagName, e.id, value)
        if (!e.set) {
          e.set = new Function('o', 'return this.innerHTML = `' + e.innerHTML.replaceAll('{', '${o.') + '`')
          console.log(e, 'defaulting set', e.set)
        }
        console.log(value)
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
)

if (caches) w.sfcache = caches.open('sanfran')

w.f = async (url, key) => {
  const j = await (await fetch(url)).json()
  if (key) state[key] = j
}

w.main = async () => {
  [...es('div')].map(e => {
    if (!e.id) e.id = (Math.random() + 1).toString(36).substring(7).toUpperCase()
    e.pr = {};
    [...e.attributes].map(a => e.pr[a.name] = a.value)
    console.log(e.at)
    if (!e.fetch && e.pr.fetch) e.fetch = f.bind(null, e.pr.fetch, e.id)
    if ('immediate' in e.pr) e.fetch()
  })
}

const fetchFromCache = async (url) => {
  const cache = await caches.open("cache-branch");
  const response = await cache.match(url);
  return fetch(url);
}

const sc = async (s) => {
  const cache = await caches.open("cache-branch");
  cache.put(null, new Response('ssss'))
}

w.enigmatic = 'loaded'