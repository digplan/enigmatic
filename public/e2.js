window.$  = document.querySelector.bind(document)
window.$$ = document.querySelectorAll.bind(document)

window.fetchJson = async (method, url, opts) => {
  const res = await fetch(url, { method, ...opts, headers: { 'Content-Type': 'application/json' }, credentials: 'include' })
  return {
    data: await res.json(),
    status: res.status,
    statusText: res.statusText,
    headers: res.headers
  }
}

window.state = new Proxy({}, {
  set(obj, prop, value) {
    obj[prop] = value
    $$(`[data="${prop}"]`).forEach(el => {
      console.log('setting', el.tagName);
      const f = window.custom[el.tagName.toLowerCase()];
      if(typeof f === 'function') {
        el.innerHTML = f(value);
      } else {
        el.innerHTML = f.render(value);
      }
    });
    return true
  }
})

// Custom elements

window.custom = {
  "hello-world": (data) => `Hello ${data}`,
  "hello-world-2": {
    prop: (data) => `${data} World`,
    render: function(data) { 
      return this.prop(data); 
    }
  },
  "api": {
    get: async (key) => {
      const res = await fetchJson('GET', `/api?key=${encodeURIComponent(key)}`)
      return res.data
    },
    set: async (key, value) => {
      const res = await fetchJson('POST', '/api', {
        body: JSON.stringify({ key, value })
      })
      return res.data
    },
    delete: async (key) => {
      const res = await fetchJson('DELETE', `/api?key=${encodeURIComponent(key)}`)
      return res.data
    },
    getAll: async () => {
      const res = await fetchJson('GET', '/all')
      return res.data
    }
  }
}