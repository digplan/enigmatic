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

w.get = async (url, datakey, process) => {
  const f = await fetch(url)
  let json = await f.json()
  if(process) {
    const func = new Function('obj', `return ${process}`)
    json = func(json)
  }
  return data[datakey] = json
}

w.wait = (ms) => new Promise((r) => setTimeout(r, ms));

w.state = new Proxy(
  {},
  {
    set: (obj, prop, value) => {
      const debug = d.body.hasAttribute('debug')
      if(debug)
        console.log('Updating app state', "'", prop, "'", value)
      for (const e of $$(`[data*=${prop}]`)) {
        const arr = e.getAttribute('data').split('.');
        arr.shift();
        for (const p of arr) value = value[p];
        e.set ? e.set(value) : (e.textContent = value);
      }
      obj[prop] = value
      if(debug) {
        console.log(window.data)
        console.log(JSON.stringify(window.data._state, null, 2))
      }
      return value
    },
    get: (obj, prop, receiver) => {
      if(prop == '_state') return obj
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
customElements.define('e-e', EnigmaticElement);

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

const start = async () => {
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
