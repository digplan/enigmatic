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
      console.log('Updating state', "'", prop, "'", value)
      for (const e of $$(`[data*=${prop}]`)) {
        const arr = e.getAttribute('data').split('.');
        arr.shift();
        for (const p of arr) value = value[p];
        e.set ? e.set(value) : (e.textContent = JSON.stringify(value));
      }
      obj[prop] = value
      return value
    },
    get: (obj, prop, receiver) => {
      if (prop == '_json') return obj
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
    if (this.render) this.render(props)
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
}
customElements.define('e-e', EnigmaticElement);

w.element = (s) => {
  let [name, html] = s[0].split(', ')
  const cls = class extends EnigmaticElement {
    connectedCallback(props) {
      const propx = {}, attrs = this.attributes;
      [...attrs].forEach((attr) => {
        propx[attr.name] = attr.value
      })
      html = html.replaceAll('{', '${o.')
      if (html.match('${o.'))
        this.hidden = true
      this.innerHTML = html
    }
    set(o) {
      console.log(o, this.innerHTML)
      const m = new Function('o', 'return `' + this.innerHTML + '`')
      this.innerHTML = m(o)
    }
  }
  customElements.define(name, cls)
  return new cls()
}

w.css = (s) => {
  document.write(`<style>${s}</style>`)
}

w.layout = async (s) => {
  await window.ready()
  const [rows, ...cols] = s[0].split(', cols: ')
  d.body.style = `display: grid; grid-template-rows: ${rows.replace('rows: ', '')}; 
    grid-template-columns: ${cols.join(' ')}`

  let cellnum = (rows.split(' ').length - 1) * (cols[0].split(' ').length)
  const colors = ['AliceBlue', 'Cornsilk', 'Ivory', 'HoneyDew', 'MistyRose', 'Azure', 'LightYellow']
  colors.concat = ['Lavender', 'LavenderBlush', 'MistyRose', 'PapayaWhip', 'BlanchedAlmond', 'Bisque', 'Moccasin']
  while (d.body.children.length < cellnum) {
    console.log('auto-create div', cellnum, d.body.children.length+1)
    const child = d.createElement('div')
    child.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    d.body.appendChild(child);
  }
}

w.queries = {}

w.data = async (s) => {
  let [url, key, immed] = s[0].split(', ')
  if (immed) {
    console.log(`getting ${url} for ${key}`)
    const f = await fetch('https://' + url)
    let json = await f.json()
    return state[key] = json
  }
  if(w.queries[url]) {
    return w.data(`${w.queries[url]}, ${url}, :immediate:`)
  }
  w.queries[key] = url
  console.log(`saved ${key} => ${url}`)
}

const start = async () => {
  await w.ready();
  if (w.main) w.main(d);
}

start()
