window.api_url = "https://localhost:3000"
window.$  = document.querySelector.bind(document)
window.$$ = document.querySelectorAll.bind(document)
window.$c = (selector) => $0.closest(selector);
window.state = new Proxy({}, {
  set(obj, prop, value) {
    obj[prop] = value
    $$(`[data="${prop}"]`).forEach(el => {
      console.log('setting', el.tagName);
      const f = window.custom?.[el.tagName.toLowerCase()];
      if (!f) return;
      if(typeof f === 'function') {
        el.innerHTML = f(value);
      } else if (f && typeof f.render === 'function') {
        el.innerHTML = f.render(value);
      }
    });
    return true
  }
})
window.get = async function(key) {
  const res = await fetch(`${window.api_url}/${encodeURIComponent(key)}`)
  return await res.json()
}
window.set = async function(key, value) {
  const res = await fetch(`${window.api_url}/${encodeURIComponent(key)}`, {
    method: 'POST', body: typeof value === 'string' ? value : JSON.stringify(value)
  })
  return await res.json()
}
window.delete = async function(key) {
  const res = await fetch(`${window.api_url}/${encodeURIComponent(key)}`, {
    method: 'DELETE'
  })
  return await res.json()
}
window.put = async function(key, body) {
  const res = await fetch(`${window.api_url}/${encodeURIComponent(key)}`, {
    method: 'PUT', body: body instanceof Blob ? body : typeof body === 'string' ? body : JSON.stringify(body)
  })
  return await res.json()
}
window.purge = async function(key) {
  const res = await fetch(`${window.api_url}/${encodeURIComponent(key)}`, {
    method: 'PURGE'
  })
  return await res.json()
}
window.list = async function() {
  const res = await fetch(`${window.api_url}`, {
    method: 'PROPFIND'
  })
  return await res.json()
}
window.download = async function(key) {
  try {
    console.log('Downloading with method DOWNLOAD:', key);
    const res = await fetch(`${window.api_url}/${encodeURIComponent(key)}`, { method: 'PATCH' });
    console.log('Response:', key, res.status, res.statusText);
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = key;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Download error:', err);
    throw err;
  }
}
window.login = function() {
  window.location.href = `${window.api_url}/login`
}
window.logout = function() {
  window.location.href = `${window.api_url}/logout`
}

// Initialize custom elements on page load
function initCustomElements() {
  Object.keys(window.custom).forEach(tagName => {
    $$(tagName).forEach(async el => {
      const f = window.custom[tagName];
      if (typeof f === 'function') {
        el.innerHTML = await f();
      } else if (f && typeof f.render === 'function') {
        el.innerHTML = f.render();
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCustomElements);
} else {
  initCustomElements();
}
