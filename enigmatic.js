const w = {},
  d = document;

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
w.child = (type, html) => {
  const e = d.createElement(type);
  e.innerHTML = html;
  d.body.appendChild(e);
  return e;
};

// Custom element

w.element = (s, style, onMount = () => { }) => {
  let [name, html] = s[0].split(', ');
  customElements.define(
    name,
    class extends HTMLElement {
      connectedCallback(props) {
        const om = onMount;
        om();
        if (style) this.innerHTML += `<style>${name} { ${style} }</style>`;
        this.innerHTML += html;
      }
    }
  );
};

// Data

w.state = new Proxy(
  {},
  {
    set: (obj, prop, value) => {
      for (const e of $$(`[data*=${prop}]`)) {
        console.log('setting e', e.tagName, e.id, value);
        if (!e.set) {
          e.set = new Function(
            'o',
            'return this.innerHTML = `' +
            e.innerHTML.replaceAll('{', '${o.') +
            '`'
          );
          console.log(e, 'defaulting set', e.set);
        }
        console.log(value);
        e.set(value);
      }
      obj[prop] = value;
      return value;
    },
    get: (obj, prop, receiver) => {
      if (prop == '_state') return obj;
      return obj[prop];
    },
  }
);

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
      e.id = (Math.random() + 1).toString(36).substring(7).toUpperCase();
    e.pr = {};
    [...e.attributes].map((a) => (e.pr[a.name] = a.value));
    if (!e.fetch && e.pr.fetch)
      e.fetch = fetchJSON.bind(null, e.pr.fetch, e.id);
    if ('immediate' in e.pr) e.fetch();
    if (!e.stream && e.pr.stream)
      e.stream = streamJSON.bind(null, e.pr.stream, e.id);
    if (e.pr.data) {
      if (this.innerHTML.contains('{')) {
        this.template = this.innerHTML.replaceAll('{', '${');
        this.innerHTML = '';
      }
      this.set = (o) => {
        if (!Array.isArray(o)) o = [o];
        const m = new Function('o', 'return `' + this.template + '`');
        o.map((i) => (this.innerHTML += m(o)));
      };
    }
  });
  d.body.child = (html, parent = document.body) => {
    const ch = document.createElement('div');
    ch.id = 'testchild';
    ch.html = html;
    parent.appendChild(ch);
    return ch;
  };
};

w.enigmatic = { version: '2022-03-01T17:12:33.046Z' }

Object.assign(window, w)

(async () => {
  await w.start()
})();
