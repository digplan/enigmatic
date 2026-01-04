window.$  = document.querySelector.bind(document)
window.$$ = document.querySelectorAll.bind(document)

window.custom = {
  "hello-world": (data) => `Hello ${data}`,
  "hello-world-2": {
    prop: (data) => `${data} World`,
    render: function(data) { 
      return this.prop(data); 
    }
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
