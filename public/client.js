import { components } from '/components.js';

window.api_url = window.api_url || window.location.origin;

export const $ = (s) => document.querySelector(s);
export const $$ = (s) => document.querySelectorAll(s);
export const $c = (s) => $0.closest(s);

const req = (method, key, body) =>
  fetch(`${window.api_url}/${key ? encodeURIComponent(key) : ''}`, {
    method,
    headers: {
      ...(localStorage.token ? { Authorization: `Bearer ${localStorage.token}` } : {}),
    },
    body: body instanceof Blob || typeof body === 'string' ? body : JSON.stringify(body),
    credentials: 'include', 
  });
const toJson = (r) => {
  const ct = (r.headers.get('content-type') || '').toLowerCase();
  if (!ct.includes('application/json')) {
    return r.text().then((t) => { 
      throw new Error('Server returned non-JSON (HTML?): ' + (t.slice(0, 60) || r.status)); 
    });
  }
  return r.json();
};

export const fetchJson = async (url, data, method = 'POST', options = {}) => {
  const { nullOnError = false, includeStatus = false } = options;
  const r = await fetch(url, { 
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(localStorage.token ? { Authorization: `Bearer ${localStorage.token}` } : {}),
    },
    body: JSON.stringify(data)
  });
  if (!r.ok && nullOnError) return null;
  const parsed = await toJson(r);
  if (includeStatus) {
    return { ok: r.ok, data: parsed };
  }
  return parsed;
};
export const get = (k) => req('GET', k).then(toJson);
export const set = (k, v) => req('POST', k, typeof v === 'string' ? JSON.stringify(v) : v).then(toJson);
export const put = (k, v) => req('PUT', k, v).then(toJson);
export const del = (k) => req('DELETE', k).then(toJson);
export const purge = (k) => req('PURGE', k).then(toJson);
export const list = () => req('PROPFIND').then(toJson);
export const me = () => fetchJson(`${window.api_url}/me`, undefined, 'GET', { nullOnError: true });
export const loginAuth0 = () => {
  window.location.href = `${window.api_url}/login`;
};
export const registerBearer = async (email, name, sub) => {
    const { ok, data } = await fetchJson(
      `${window.api_url}/register`,
      { email, name, sub },
      'POST',
      { includeStatus: true }
    );
    if (ok && data?.token) localStorage.token = data.token;
    return data;
  };
export const loginBearer = async (sub) => {
    const { ok, data } = await fetchJson(
      `${window.api_url}/login`,
      { sub },
      'POST',
      { includeStatus: true }
    );
    if (ok && data?.token) localStorage.token = data.token;
    return data;
  };
export const login = () => loginAuth0();
export const logoutAuth0 = () => {
  window.location.href = `${window.api_url}/logout`;
};
export const logoutBearer = async () => {
    const t = localStorage.token;
    if (!t) return null;
    const r = await fetchJson(`${window.api_url}/logout`, undefined, 'GET', { nullOnError: true }).catch(() => null);
    delete localStorage.token;
    return r;
  };
export const logout = async () => {
    const t = localStorage.token;
    if (t) {
      await logoutBearer();
      return;
    }
    logoutAuth0();
  };
export const download = async (k) => {
    const r = await req('PATCH', k);
    if (!r.ok) throw new Error('Download failed');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(await r.blob());
    a.download = k;
    a.click();
    URL.revokeObjectURL(a.href); 
  };

const componentRegistry = components && typeof components === 'object' ? components : {};

const wireComponentActions = (root) => {
  root.querySelectorAll('[data-vl-action="download"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const key = decodeURIComponent(btn.dataset.name || '');
      if (!key) return;
      await download(key);
    });
  });
  root.querySelectorAll('[data-vl-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const key = decodeURIComponent(btn.dataset.name || '');
      if (!key) return;
      await purge(key);
      location.reload();
    });
  });
  root.querySelectorAll('input[data-vl-action="upload"]').forEach((input) => {
    input.addEventListener('change', async () => {
      const f = input.files && input.files[0];
      if (!f) return;
      await put(f.name, f);
      location.reload();
    });
  });
  root.querySelectorAll('[data-vl-action="login"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      login();
    });
  });
};

const ren = async (el, v) => {
  const f = componentRegistry[el.tagName.toLowerCase()];
  if (f) {
    const dataAttr = el.getAttribute('data');
    const val = v !== undefined ? v : (dataAttr ? state[dataAttr] : undefined);
    try {
      if (f.render) {
        el.innerHTML = await f.render.call(f, val);
      } else if (typeof f === 'function') {
        el.innerHTML = await f(val);
      }
      wireComponentActions(el);
    } catch (e) {
      console.error(e);
    }
  }
};

export const state = new Proxy({}, {
  set(o, p, v) {
    o[p] = v;
    $$(`[data="${p}"]`).forEach(el => ren(el, v));
    return true;
  }
});

export const initComponents = () => {
    if (!document.body) return;
    Object.keys(componentRegistry).forEach((t) => {
      const elements = $$(t);
      if (elements.length > 0) {
        elements.forEach(el => ren(el));
      }
    });
  };

const boot = () => {
  initComponents();
  setTimeout(() => initComponents(), 10);
  if (document.body) {
    new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const tag = node.tagName?.toLowerCase();
            if (tag && componentRegistry[tag]) ren(node);
            node.querySelectorAll && Array.from(node.querySelectorAll('*')).forEach((child) => {
              const childTag = child.tagName?.toLowerCase();
              if (childTag && componentRegistry[childTag]) ren(child);
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
