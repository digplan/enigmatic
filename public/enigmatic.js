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

w.data = new Proxy(
  {},
  {
    set: (obj, prop, value) => {
      for (const e of $$(`[data=${prop}]`)) {
        const arr = e.getAttribute('data').split('.');
        arr.shift();
        for (const p of arr) value = value[p];
        e.set ? e.set(value) : (e.textContent = value);
      }
      return prop;
    },
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
  connectedCallback() {
    const props = {}, attrs = this.attributes;
    [...attrs].forEach((attr) => {
      props[attr.name] = attr.value
    })
    console.log('rendering')
    this.render(props)
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
