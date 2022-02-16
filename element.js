window.onerror = function(msg, url, line) {
  const s = "Error: " + msg + "\nURL: " + url + "\nLine: " + line
  document.write(`<div style='color:red; display:fixed'>${s}</div>`)
}

try {
window.$$ = document.querySelectorAll.bind(document)
window.state = new Proxy(
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

window.ready = async () => {
  return new Promise((r) => {
    if (document.readyState === 'complete') r(true);
    document.onreadystatechange = () => {
      if (document.readyState === 'complete') r();
    };
  });
};
 
window.element = (s) => {
  let [name, data, html, arr] = s[0].split(', ')
  const cls = class extends HTMLElement {
    props = {}
    connectedCallback(props) {
      if(!this.getAttribute('data')) this.setAttribute('data', name);
      [...this.attributes].forEach((attr) => {
        html = html.replace(`{prop:${attr.name}}`, attr.value)
      })
      if (html.match('{')) {
        this.style.opacity = 0
        this.template = html.replaceAll('{', '${o.')
      }
      this.innerHTML = html
      if(data.startsWith('e://'))
        return this.setAttribute('data', data.replace('e://', ''))
      if(data.startsWith('//'))
        return this.fetch(data)
      this.setAttribute('data', data)
    }
    async fetch(url) {
      const o = await(await fetch(`https://${url}`)).json()
      state[name] = o
    }
    set(o) { 
      console.log('setting', name, o)
      this.innerHTML = ''
      if(!arr)
        return this.innerHTML = (new Function('o', 'return `' + this.template + '`'))(o)
      else
        o[arr].forEach((i) => { this.innerHTML += (new Function('o', 'return `' + this.template + '`'))(i) })
    }
  }
  customElements.define(name, cls)
  return window
}

window.css = (s) => {
  document.write(`<style>${s}</style>`)
}

window.layout = async (s) => {
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

window.queries = {}

window.data = async (s) => {
  let [url, key, immed] = s[0].split(', ')
  if (immed) {
    console.log(`getting ${url} for ${key}`)
    const f = await fetch('https://' + url)
    let json = await f.json()
    return state[key] = json
  }
  if(window.queries[url]) {
    console.log(`getting saved ${url}`)
    if (window.queries[url].startsWith('{'))
      return state[key] = JSON.parse(w.queries[url])
    const f = await fetch('https:' + w.queries[url])
    let json = await f.json()
    return state[url] = json
  }
  window.queries[key] = url
}

window.mockapi = async (s) => {
  const p = s[0].split(', ')
  const key = p.pop()
  const obj = p
  console.log(obj.join(''))
  w.queries[key] = obj.join('').replace(/\r|\n/g, '')
}

(async () => {
  await window.ready();
  if (window.main) w.main(d);
})()

} catch (e) {
  const s = "Error: " + msg + "\nURL: " + url + "\nLine: " + line
  document.write(`<div style='color:red; display:fixed'>${s}</div>`)
}