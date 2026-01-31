const D = document, W = window, Enc = encodeURIComponent;

// 1. Unified Render Logic (Handles both State & Custom Elements)
const ren = async (el, v) => {
  const f = W.custom?.[el.tagName.toLowerCase()];
  if (f) {
    const dataAttr = el.getAttribute('data');
    const val = v !== undefined ? v : (dataAttr ? W.state[dataAttr] : undefined);
    try {
      if (f.render) {
        el.innerHTML = await f.render.call(f, val);
      } else if (typeof f === 'function') {
        el.innerHTML = await f(val);
      }
    } catch(e) { console.error(e) }
  }
};

// 2. Proxies setup
const cProx = new Proxy({}, {
  set(t, p, v) {
    t[p] = v;
    setTimeout(() => {
      if (W.$$ && D.body) {
        W.$$(p).forEach(el => ren(el));
      }
    }, 0);
    return true;
  }
});
Object.defineProperty(W, 'custom', { 
  get: () => cProx, 
  set: v => { 
    Object.keys(v || {}).forEach(k => cProx[k] = v[k]); 
    // Defer initialization to ensure DOM and functions are ready
    setTimeout(() => {
      if (W.initCustomElements && D.body) W.initCustomElements();
    }, 50);
  },
  configurable: true
});

const sProx = new Proxy({}, {
  set(o, p, v) {
    o[p] = v;
    W.$$(`[data="${p}"]`).forEach(el => ren(el, v));
    return true;
  }
});

// 3. API & DOM Helpers
const req = (m, k, b) => fetch(`${W.api_url}/${k ? Enc(k) : ''}`, {
  method: m, body: b instanceof Blob || typeof b === 'string' ? b : JSON.stringify(b)
});

const toJson = (r) => {
  const ct = (r.headers.get('content-type') || '').toLowerCase();
  if (!ct.includes('application/json')) return r.text().then((t) => { throw new Error('Server returned non-JSON (HTML?): ' + (t.slice(0, 60) || r.status)); });
  return r.json();
};

Object.assign(W, {
  $: s => D.querySelector(s),
  $$: s => D.querySelectorAll(s),
  $c: s => $0.closest(s),
  state: sProx,
  get: k => req('GET', k).then(toJson),
  set: (k, v) => req('POST', k, v).then(toJson),
  put: (k, v) => req('PUT', k, v).then(toJson),
  delete: k => req('DELETE', k).then(toJson),
  purge: k => req('PURGE', k).then(toJson),
  list: () => req('PROPFIND').then(toJson),
  me: () => fetch(`${W.api_url}/me`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
  login: () => W.location.href = `${W.api_url}/login`,
  logout: () => W.location.href = `${W.api_url}/logout`,
  download: async (k) => {
    const r = await req('PATCH', k);
    if (!r.ok) throw new Error('Download failed');
    const a = D.createElement('a');
    a.href = URL.createObjectURL(await r.blob());
    a.download = k;
    a.click();
    URL.revokeObjectURL(a.href);
  },
  initCustomElements: () => {
    if (!D.body) return;
    Object.keys(W.custom || {}).forEach(t => {
      const elements = W.$$(t);
      if (elements.length > 0) {
        elements.forEach(el => ren(el));
      }
    });
  }
});

// 4. Initialization & Observers
const boot = () => {
  if (W.initCustomElements) {
    // Run immediately and also after a short delay to catch any elements added during script execution
    W.initCustomElements();
    setTimeout(() => W.initCustomElements(), 10);
  }
  if (D.body) {
    new MutationObserver((mutations) => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            const tag = node.tagName?.toLowerCase();
            if (tag && W.custom?.[tag]) ren(node);
            // Also check children
            node.querySelectorAll && Array.from(node.querySelectorAll('*')).forEach(child => {
              const childTag = child.tagName?.toLowerCase();
              if (childTag && W.custom?.[childTag]) ren(child);
            });
          }
        });
      });
    }).observe(D.body, { childList: true, subtree: true });
  }
};
if (D.readyState === 'loading') {
  D.addEventListener('DOMContentLoaded', boot);
} else {
  setTimeout(boot, 0);
}