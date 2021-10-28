window.$ = document.querySelector.bind(document)
window.$$ = document.querySelectorAll.bind(document)
window.body = document.body

window.DataSources = {}

window.load = src => {
  return new Promise((r, j)=>{
    const s = document.createElement('script')
    s.src = src
    s.addEventListener('load', r)
    document.head.appendChild(s)
  })
}

window.DATA = new Proxy(
  {},
  {
    set: (obj, prop, value) => {
      obj[prop] = value
      $$(`[data^=${prop}]`).forEach(control => {
        if (control.set) control.set(value)
        else control.innerHTML = value
      })
      return prop;
    },
  }
)

class EnigmaticElement extends HTMLElement {
  constructor() {
    super();
    for (let attr of Array.from(this.attributes)) this[attr.name] = attr.value;
  }
  toggle() {
    this.classList.toggle('hide')
    this.classList.toggle('show')
  }
  set(s) {
    this.innerHTML = s
  }
}

class MapEmbed extends EnigmaticElement {
  constructor() {
    super()
    this.innerHTML = `<iframe height='100%' width=100% frameborder=0 src="https://maps.google.com/maps?f=q&source=s_q&hl=en&geocode=&q=${
      this.getAttribute('where') || 'Chicago'
    }&output=embed"></iframe>`
  }
}

class YouTube extends EnigmaticElement {
  constructor() {
    super()
    this.innerHTML = `<embed src='//www.youtube.com/embed/${
      this.getAttribute('id') || 'MlDx9s-zJMM'
    }?rel=0&amp;controls=0&amp;showinfo=0' style='height:100%;width:100%' />`
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

class DataSource {
  constructor() {
    [this.dataclass, this.datasrc] = body.getAttribute('datasrc').split(':')
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

document.addEventListener('DOMContentLoaded', () => {
  const datacls = new window[body.getAttribute('datasrc').split(':')[0]]();
  DataSources[datacls.datasrc] = datacls;
  if (window.main) window.main();
});
