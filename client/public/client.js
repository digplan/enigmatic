const ren = async (el, v) => {
  const f = window.custom?.[el.tagName.toLowerCase()];
  if (f) {
    const dataAttr = el.getAttribute('data');
    const val = v !== undefined ? v : (dataAttr ? window.state[dataAttr] : undefined);
    try {
      if (f.render) {
        el.innerHTML = await f.render.call(f, val);
      } else if (typeof f === 'function') {
        el.innerHTML = await f(val);
      }
    } catch (e) {
      console.error(e);
    }
  }
};

window.custom = {};

// 2. State proxy
const sProx = new Proxy({}, {
  set(o, p, v) {
    o[p] = v;
    window.$$(`[data="${p}"]`).forEach(el => ren(el, v));
    return true;
  }
});

// 4. API helpers
const req = (method, key, body) =>
  fetch(`${window.api_url}/${key ? encodeURIComponent(key) : ''}`, {
    method,
    body: body instanceof Blob || typeof body === 'string' ? body : JSON.stringify(body),
    credentials: 'include',
  });

const toJson = (r) => {
  const ct = (r.headers.get('content-type') || '').toLowerCase();
  if (!ct.includes('application/json')) {
    return r.text().then((t) => { throw new Error('Server returned non-JSON (HTML?): ' + (t.slice(0, 60) || r.status)); });
  }
  return r.json();
};

Object.assign(window, {
  $: (s) => document.querySelector(s),
  $$: (s) => document.querySelectorAll(s),
  $c: (s) => $0.closest(s),
  state: sProx,
  get: (k) => req('GET', k).then(toJson),
  set: (k, v) => req('POST', k, v).then(toJson),
  put: (k, v) => req('PUT', k, v).then(toJson),
  delete: (k) => req('DELETE', k).then(toJson),
  purge: (k) => req('PURGE', k).then(toJson),
  list: () => req('PROPFIND').then(toJson),
  me: () => fetch(`${window.api_url}/me`, { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)),
  login: () => window.location.href = `${window.api_url}/login`,
  logout: () => window.location.href = `${window.api_url}/logout`,
  download: async (k) => {
    const r = await req('PATCH', k);
    if (!r.ok) throw new Error('Download failed');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(await r.blob());
    a.download = k;
    a.click();
    URL.revokeObjectURL(a.href);
  },
  initCustomElements: () => {
    if (!document.body) return;
    Object.keys(window.custom || {}).forEach((t) => {
      const elements = window.$$(t);
      if (elements.length > 0) {
        elements.forEach(el => ren(el));
      }
    });
  }
});

// 5. Boot
const boot = () => {
  if (window.initCustomElements) {
    window.initCustomElements();
    setTimeout(() => window.initCustomElements(), 10);
  }
  if (document.body) {
    new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const tag = node.tagName?.toLowerCase();
            if (tag && window.custom?.[tag]) ren(node);
            node.querySelectorAll && Array.from(node.querySelectorAll('*')).forEach((child) => {
              const childTag = child.tagName?.toLowerCase();
              if (childTag && window.custom?.[childTag]) ren(child);
            });
          }
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }
};
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  setTimeout(boot, 0);
}
