// Global namespace object and document shortcut
const w = {}, d = document
w.enigmatic = { version: '2026-01-03 0.23.0' }

// Display error banner at top of page
const showError = (err, source, line, col) => {
  const errorDiv = d.createElement('div')
  errorDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ff4444;color:white;padding:20px;z-index:10000;font-family:monospace;border-bottom:4px solid #cc0000;'
  errorDiv.innerHTML = `<strong>JavaScript Error:</strong><br>${err}<br><small>${source ? source + ':' : ''}${line ? ' line ' + line : ''}${col ? ':' + col : ''}</small>`
  d.body.insertBefore(errorDiv, d.body.firstChild)
}

// Global error handler for uncaught JavaScript errors
window.onerror = (err, source, line, col) => {
  showError(err, source, line, col)
  return false
}

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
  showError(e.reason?.message || e.reason || 'Unhandled Promise Rejection', '', '', '')
})

// DOM query shortcuts
w.$ = d.querySelector.bind(d)
w.$$ = d.querySelectorAll.bind(d)

// Dynamically load JavaScript file (prevents duplicate loading)
w.loadJS = (src) => {
  return new Promise((r, j) => {
    if (w.$(`script[src="${src}"]`)) return r(true) // Already loaded
    const s = d.createElement('script')
    s.src = src
    s.addEventListener('load', r)
    s.addEventListener('error', j)
    d.head.appendChild(s)
  })
}

// Utility: wait for specified milliseconds
w.wait = (ms) => new Promise((r) => setTimeout(r, ms))

// Wait for document to be fully loaded
w.ready = async () => {
  return new Promise((r) => {
    if (document.readyState === 'complete') return r(true)
    document.addEventListener('readystatechange', () => {
      if (document.readyState === 'complete') r()
    })
  })
}

// Register custom web component
// If fn is a function, it becomes a render function that receives data
// If fn is an object, it can contain init, set, event handlers, etc.
w.e = (name, fn = {}, style = {}) => {
  console.log(`registering component ${name}`)
  customElements.define(name, class extends HTMLElement {
    connectedCallback() {
      // Apply styles to element
      Object.assign(this.style, style)
      if (typeof fn === 'function') {
        // Function mode: create set() method that renders HTML from function
        this.set = (data) => {
          this.innerHTML = fn(data)
        }
      } else {
        // Object mode: assign all methods/properties to element
        Object.assign(this, fn)
        // Auto-bind event handlers (click, mouseover, etc.)
        Object.keys(fn).filter(k=>k.match(/click|mouseover/)).forEach(k=>{
          this.addEventListener(k, fn[k], true)
        })
        // Call init if provided
        if(this.init) this.init(this)
      }
    }
  })
}

// Reactive state: automatically updates elements when state changes
w.state = new Proxy({}, {
  set: async (obj, prop, value) => {
    await w.ready()
    console.log('state change:', prop, value)
    // Skip update if value hasn't changed
    if (obj[prop] === value) {
      return true
    }
    // Find all elements with matching data attribute and call their set() method
    for (const e of w.$$(`[data="${prop}"]`)) {
      if (e.set) e.set(value)
    }
    obj[prop] = value
    return true
  },
  get: (obj, prop, receiver) => {
    // Special property to get entire state object
    if (prop == '_all') return obj
    return obj[prop]
  }
})

// Fetch JSON from URL, optionally transform and store in state
w.get = async (url, opts = {}, transform, key) => {
  const res = await fetch(url, opts)
  if (!res.ok) throw Error(`Could not fetch ${url}`)
  let data = await res.json()
  if (transform) data = transform(data) // Apply transform function if provided
  if (key) w.state[key] = data // Store in state if key provided
  return data
}

// Stream data via Server-Sent Events (SSE)
w.stream = async (url, key) => {
  const ev = new EventSource(url)
  ev.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data)
      if (key) w.state[key] = data // Update state with each message
      return data
    } catch (err) {
      showError(err.message || err, '', '', '')
    }
  }
  ev.onerror = (e) => {
    showError('EventSource error', '', '', '')
    ev.close()
  }
  return ev
}

// Template engine: replace {placeholder} with values from object
// Supports nested properties (e.g., {user.name}) and special vars ($key, $val, $index)
w.flatten = (obj, text, context = {}) => {
  // Check if template uses special iteration variables
  const hasSpecialVars = /{\$key}|{\$val}|{\$index}/.test(text)
  
  // Arrays: map over each item, providing $key, $index, $val
  if (obj instanceof Array)
    return obj.map((o, i) => w.flatten(o, text, { ...context, $key: i, $index: i, $val: o })).join('')
  
  // Objects with special vars: iterate over entries, providing $key and $val
  if (hasSpecialVars && obj && typeof obj === 'object' && !Array.isArray(obj))
    return Object.entries(obj).map(([k, v]) => w.flatten(v, text, { ...context, $key: k, $val: v })).join('')
  
  // Find all {placeholder} patterns in template
  const m = text.match(/{([^}]*)}/gm) || []
  for (const txt of m) {
    const key = txt.replaceAll(/{|}/g, '')
    // Check context first (for special vars), then object properties
    let val = context[key] !== undefined ? context[key] : undefined
    if (val === undefined && obj && typeof obj === 'object') {
      // Support dot notation: {user.name}
      val = obj
      for (let k of key.split('.')) {
        val = val?.[k]
      }
    } else if (val === undefined) {
      // Fallback to obj itself if key not found
      val = obj
    }
    // Replace placeholder with value (or empty string if undefined)
    text = text.replaceAll(txt, val ?? '')
  }
  return text
}

// Methods added to div elements for data binding
const props = {
    // Initialize: save template, clear content, optionally fetch data
    async init() {
      // Extract and remove IGNORE blocks from template
      let ignore = this.innerHTML.match(/<!--IGNORE-->.*?<!--ENDIGNORE-->/gms) || []
      if (!ignore.length) {
        this.template = this.innerHTML
      } else {
        this.ignoreblock = ignore
        this.template = this.innerHTML
        // Remove all IGNORE blocks from template
        ignore.forEach(block => {
          this.template = this.template.replace(block, '')
        })
      }
      this.innerHTML = '' // Clear for rendering
      // Auto-fetch unless defer attribute is present
      if (!this.hasAttribute('defer')) {
        this.fetch()
      }
    },
    // Update element content with data using template
    set(o) {
      console.log('setting', this, this.template, o)
      this.innerHTML = w.flatten(o, this.template)
      // Sync to state if data attribute exists
      const dt = this.getAttribute('data')
      if(dt)
        w.state[dt] = o
    },
    // Fetch data from URL or parse inline JSON
    async fetch() {
      try {
        const u = this.getAttribute('fetch')
        if(!u) return
        // Inline JSON: parse directly
        if (u.startsWith('[') || u.startsWith('{'))
          return this.set(JSON.parse(u))
        const opts = {}
        const f = await fetch(u, opts)
        console.log(f)
        if (!f.ok) throw Error(`Could not fetch ${u}`)
        let data = await f.json()
        // Apply transform function if 't' attribute exists
        const tf = this.getAttribute('t')
        if (tf) {
          try {
            data = new Function('return ' + tf)()(data)
          } catch (err) {
            showError(`Transform error: ${err.message}`, '', '', '')
          }
        }
        this.set(data)
      } catch (err) {
        showError(err.message || err, '', '', '')
      }
    }
}

// Register components from window.components object
for (let name in window.components) 
  w.e(name, window.components[name], window.components[name]?.style)

// Expose all functions to global scope (window)
Object.assign(window, w);

// Initialize: wait for DOM, then enhance all divs with data binding
(async () => {
  try {
    await ready()
    // Add props to all divs and initialize them
    for (const i of w.$$('div')) {
      Object.assign(i, props)
      i?.init()
    }
  } catch (err) {
    showError(err.message || err, '', '', '')
  }
})()
