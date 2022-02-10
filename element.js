window.onerror = function(msg, url, line) {
  const s = "Error: " + msg + "\nURL: " + url + "\nLine: " + line
  document.write(`<div style='color:red; display:fixed'>${s}</div>`)
}

try {
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
      console.log('Updating state:', prop, value)
      for (const e of $$(`[data*=${prop}]`)) {
        const arr = e.getAttribute('data').split('.');
        arr.shift();
        for (const p of arr) value = value[p];
        e.set ? e.set(value) : (e.textContent = JSON.stringify(value));
        e.style.opacity = 1
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
  async show() {
    this.style.opacity = 1
  }
  async hide() {
    this.style.opacity = 0
  }
  set(s) {
    if (typeof s === 'object') {
      s = JSON.stringify(s)
    }
    this.innerHTML = s
  }
  css(s) {
    console.log(s)
    this.style.cssText = s
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
      if (html.match('{')) {
        this.style.opacity = 0
        this.template = html.replaceAll('{', '${o.')
      }
      this.innerHTML = html
    }
    set(o) {
      const m = new Function('o', 'return `' + this.template + '`')
      this.innerHTML = m(o)
    }
  }
  customElements.define(name, cls)
  return window
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
    console.log(`getting saved ${url}`)
    if (w.queries[url].startsWith('{'))
      return state[key] = JSON.parse(w.queries[url])
    const f = await fetch('https:' + w.queries[url])
    let json = await f.json()
    return state[url] = json
  }
  w.queries[key] = url
}
w.mockapi = async (s) => {
  const p = s[0].split(', ')
  const key = p.pop()
  const obj = p
  console.log(obj.join(''))
  w.queries[key] = obj.join('').replace(/\r|\n/g, '')
}
const start = async () => {
  await w.ready();
  if (w.main) w.main(d);
}
start()
} catch(e) {
  document.write(`<div style='color:red; display:fixed'>${e.stack}</div>`)
}