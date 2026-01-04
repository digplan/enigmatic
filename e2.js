window.$  = document.querySelector.bind(document)
window.$$ = document.querySelectorAll.bind(document)

window.custom = {
  "hello-world": (data) => ({
    prop: () => `Hello ${data || 'World'}!`,
    render: `Hello ${data || 'World'}!`
  })
}

window.state = new Proxy({}, {
  set(obj, prop, value) {
    obj[prop] = value
    for (const e of $$(`[data="${prop}"]`)) {
      const tag = e.tagName.toLowerCase()
      if (custom[tag]) {
        e.innerHTML = custom[tag](value).render
      }
    }
    return true
  }
})