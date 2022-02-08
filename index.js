window.$ = document.querySelector.bind(document)
window.$$ = document.querySelectorAll.bind(document)
window.body = document.body;
window.DataSources = {};
window.load = src => {
  return new Promise((r, j) => {
    const s = document.createElement('script')
    s.src = src
    s.addEventListener('load', r)
    document.head.appendChild(s)
  })
}
window.DATA = new Proxy(
  {_updated:new Date().toISOString()},
  {
    set: (obj, prop, value) => {
      obj[prop] = value
      $$(`[data^=${prop}]`).forEach(control => {
        if (control.set) control.set(value)
        else control.innerHTML = value
      })
      this.updated = new Date().toISOString()
      return prop;
    },
  }
)

class EnigmaticElement extends HTMLElement {
  constructor() {
    super()
  }
  connectedCallback() {
    if (!this.id) this.id = +new Date() + Math.random()
    for (let attr of this.attributes) 
      this[attr.name] = attr.value
  }
  show() {
    this.style.transition = 'opacity 0.2s ease-in-out'
    this.style.opacity = 1
  }
  hide() {
    this.style.transition = 'opacity 0.2s ease-in-out'
    this.style.opacity = 0
  }
  showModal() {
    if (!this.classList.contains('show'))
      return
    $$(':not(body)').forEach((e) => {
      if (this.id === e.id || e.id.match(/play/) || !e.id) return
      e.classList.add('noevents')
      e.classList.add('blur')
    })
  }
  removeModal() {
    $$(':not(body)').forEach((e) => {
      e.classList.remove('blur')
      e.classList.remove('noevents')
    })
  }
  animateTop() {
    this.classList.add('animate-top')
    const e = this
    setTimeout(function () { e.classList.remove('animate-top') }, 3000)
  }
  set(s) {
    this.innerHTML = s
  }
}
customElements.define('e-e', EnigmaticElement)

class MapEmbed extends EnigmaticElement {
  connectedCallback() {
    this.innerHTML = `<iframe height='100%' width=100% frameborder=0 src="https://maps.google.com/maps?f=q&source=s_q&hl=en&geocode=&q=${this.getAttribute('where') || 'Chicago'
      }&output=embed"></iframe>`;
  }
}
class EMenu extends HTMLUListElement {
  constructor() {
    super()
  }
  toggle() {
    this.classList.toggle('hide');
    this.classList.toggle('show');
  }
}

class View extends EnigmaticElement {
  constructor() {
    super();
    if (this.agent && !navigator.userAgent.match(this.agent)) this.remove()
  }
  showOnly() {
    let visible = $$('view-panel:not([class="hide"])')
    for (let e of visible) e.toggle()
    this.toggle()
  }
}


window.DataLocalStorage = class DataLocalStorage extends DataSource {
  constructor() {
    super()
    console.log(`loaded ${this.dataclass} ${this.datasrc}`)
    if (!localStorage.getItem('enigmatic'))
      localStorage.setItem('enigmatic', 'v0.2.0')
    DATA['_version'] = localStorage.getItem('enigmatic')
  }
}

window.DataEventSource = class DataEventSource extends DataSource {
  constructor() {
    super()
    const es = new EventSource(this.datasrc)
    es.onmessage = ({ data: d }) => {
      const obj = JSON.parse(d)
      DATA['time'] = obj.time;
    }
  }
}

customElements.define('map-embed', MapEmbed);
customElements.define('youtube-video', YouTube);
customElements.define('view-panel', View);
customElements.define('font-awesome', FontAwesome, { extends: 'i' });
customElements.define('simple-menu', EMenu, { extends: 'ul' });

document.addEventListener('DOMContentLoaded', () => {
  if (window.main) window.main();
})