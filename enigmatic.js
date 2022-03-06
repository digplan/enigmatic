const w = {}, d = document;

// helpers

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
w.child = (type = 'div', html = '') => {
  const e = d.createElement(type);
  e.innerHTML = html;
  d.body.appendChild(e);
  return e;
};

// Custom element

if(window.components) {
  for(let name in window.components)
    w.element(name, window.components[name])
}
w.element = (name, {onMount = x=>x, beforeData = x=>x, style, template = ''}) => {
  customElements.define(name, class extends HTMLElement {
    connectedCallback(props) {
        onMount()
        if (style) this.innerHTML += `<style>${name} { ${style} }</style>`;
        this.template = template;
    }
    set(o)  {
      this.innerHTML = ''
      o = beforeData(o)
      if(!Array.isArray(o)) o = [o];
      const m = new Function('o', 'return `' + this.template + '`');
      o.map((i) => (this.innerHTML += m(o)));
    }
  })
}

// Data

w.state = new Proxy(
  {}, {
    set: (obj, prop, value) => {
      let ret = []
      for (const e of $$(`[data*=${prop}]`)) {
        console.log(['setting e', e.tagName, e.id, value])
        e.set(value);
      }
      obj[prop] = value;
    },
    get: (obj, prop, receiver) => {
      if (prop == '_state') return obj;
      return obj[prop];
    },
  }
)

w.dataEvent = (x) => console.log(`dataevent: ${x}`);

w.fetchJSON = async (url, key) => {
  const j = await (await fetch(url)).json();
  if (key) state[key] = j;
  dataEvent(j);
  return j;
};

w.streamJSON = async (url, key) => {
  const ev = new EventSource(url);
  ev.onmessage = (ev) => {
    const j = JSON.parse(ev.data);
    if (key) state[key] = j;
    dataEvent(j);
    return j;
  };
};

// State changes

w.trackStateChanges = () =>
(w.dataEvent = (o) =>
  localStorage.set(new Date().toISOString(), JSON.stringify(o)));
w.untrackStateChanges = () =>
  (w.dataEvent = (o) => console.log('dataevent:', o));

// Startup

w.start = async () => {
  await w.ready();
  [...$$('div')].map((e) => {
    if (!e.id)
      e.id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 3)
    e.pr = {};
    [...e.attributes].map((a) => (e.pr[a.name] = a.value));
    if (e.pr.fetch) e.fetch = fetchJSON.bind(null, e.pr.fetch, e.id);
    if ('immediate' in e.pr) e.fetch();
    if (e.pr.stream) e.stream = streamJSON.bind(null, e.pr.stream, e.id);
    if (e.pr.data) {
      if (e.innerHTML && e.innerHTML.includes('{')) {
        e.template = e.innerHTML.replaceAll('{', '${');
        e.innerHTML = '';
      }
      e.set = (o) => {
        e.innerHTML = ''
        if (!Array.isArray(o)) o = [o];
        const m = new Function('o', 'return `' + e.template + '`');
        o.map((i) => (e.innerHTML += m(i)));
      };
    }
  })
}

w.enigmatic = { version: '2022-03-05 0.10.2' };
Object.assign(window, w);

(async() => {
  await w.start()
  if(window.main) window.main()
})();