window.api_url = "https://enigmatic.digplan.workers.dev"

window.$  = document.querySelector.bind(document)
window.$$ = document.querySelectorAll.bind(document)

window.fetchJson = async (method, url, opts) => {
  const res = await fetch(url, { method, ...opts, credentials: 'include' })
  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  let data
  try {
    data = isJson ? await res.json() : await res.text()
  } catch (e) {
    data = await res.text()
  }
  return {
    data,
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
    get: async function(key) {
      const res = await fetchJson('GET', `${window.api_url}/${encodeURIComponent(key)}`)
      return res.data
    },
    set: async function(key, value) {
      const res = await fetchJson('POST', `${window.api_url}/${encodeURIComponent(key)}`, {
        body: typeof value === 'string' ? value : JSON.stringify(value)
      })
      return res.data
    },
    delete: async function(key) {
      const res = await fetchJson('DELETE', `${window.api_url}/${encodeURIComponent(key)}`)
      return res.data
    },
    put: async function(key, body) {
      const res = await fetchJson('PUT', `${window.api_url}/${encodeURIComponent(key)}`, {
        body: body instanceof Blob ? body : typeof body === 'string' ? body : JSON.stringify(body)
      })
      return res.data
    },
    purge: async function(key) {
      const res = await fetchJson('POST', `${window.api_url}/${encodeURIComponent(key)}`, {
        headers: { 'X-HTTP-Method-Override': 'PURGE' }
      })
      return res.data
    },
    login: function() {
      window.location.href = `${window.api_url}/login`
    },
    logout: function() {
      window.location.href = `${window.api_url}/logout`
    }
  }
}