const D = document, W = window, Enc = encodeURIComponent;

// 1. Unified Render Logic (Handles both State & Custom Elements)
const ren = async (el, v) => {
  const f = W.custom?.[el.tagName.toLowerCase()];
  if (f) {
    const dataAttr = el.getAttribute('data');
    const val = v !== undefined ? v : (dataAttr ? W.state[dataAttr] : undefined);
    try { el.innerHTML = await (f.render || f)(val) } catch(e) { console.error(e) }
  }
};

// 2. Proxies setup
const cProx = new Proxy({}, {
  set(t, p, v) {
    t[p] = v;
    setTimeout(() => W.$$(p).forEach(el => ren(el)), 0);
    return true;
  }
});
Object.defineProperty(W, 'custom', { get: () => cProx, set: v => Object.assign(cProx, v) });

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

Object.assign(W, {
  $: s => D.querySelector(s),
  $$: s => D.querySelectorAll(s),
  $c: s => $0.closest(s),
  state: sProx,
  get: k => req('GET', k).then(r => r.json()),
  set: (k, v) => req('POST', k, v).then(r => r.json()),
  put: (k, v) => req('PUT', k, v).then(r => r.json()),
  delete: k => req('DELETE', k).then(r => r.json()),
  purge: k => req('PURGE', k).then(r => r.json()),
  list: () => req('PROPFIND').then(r => r.json()),
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
  initCustomElements: () => Object.keys(W.custom || {}).forEach(t => W.$$(t).forEach(el => ren(el)))
});

// 4. Initialization & Observers
const boot = () => {
  W.initCustomElements();
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
};
D.readyState === 'loading' ? D.addEventListener('DOMContentLoaded', boot) : boot();