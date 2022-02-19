window.onerror = function (msg, url, line) {
  const s = "Error: " + msg + "\nURL: " + url + "\nLine: " + line
  document.write(`<div style='color:red; display:fixed'>${s}</div>`)
}

import Components from './components.mjs';

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
      const debug = d.body.hasAttribute('debug')
      if (debug)
        console.log('Updating app state', "'", prop, "'", value)
      for (const e of $$(`[data*=${prop}]`)) {
        const arr = e.getAttribute('data').split('.');
        arr.shift();
        for (const p of arr) value = value[p];
        e.set ? e.set(value) : (e.textContent = value);
      }
      obj[prop] = value
      if (debug) {
        console.log(window.data)
        console.log(JSON.stringify(window.data._state, null, 2))
      }
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

w.customElement = ({ name, props, style, template }) => {
  customElements.define(name, class extends HTMLElement {
    async connectedCallback() {
      const p = [...this.attributes].reduce((p, c) => {p[c.name] = c.value; return p}, {})
      if(props.fetch) this.setAttribute('data', this.tagName)
      if (this.main) this.main(props)
    }
    stream(url, options) {
      const ev = new EventSource(url)
      ev.onmessage = (e) => {
        state[this.tagName] = JSON.parse(e.data)
      }
    }
    fetch(url, options) {
      const json = await(await fetch(url, options)).json()
      state[this.tagName] = json
    }
    set(data) {
      if (!Array.isArray(data)) data = [data]
      const f = new Function('o', 'return `' + template + '`')
      this.innerHTML = o[arr].forEach((i) => {
        this.innerHTML += f(i)
      })
    }
  })
}

w.element = (s) => {
  let [name, html] = s[0].split(', ')
  customElements.define(name, class extends HTMLElement {
    connectedCallback(props) {
      html = html.replaceAll('{', '${')
      this.template = html
      if (!html.match(/\$\{/)) this.innerHTML = html
    }
    set(o) {
      const m = new Function('o', 'return `' + this.template + '`')
      this.innerHTML = m(o)
    }
  })
}

const start = async () => {
  Components.map(w.customElement)
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

start()
