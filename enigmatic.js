// e 0.9.16
window.$ = document.querySelector.bind(document)
window.$$ = document.querySelectorAll.bind(document)
window.loadJS = src => {
    return new Promise((r, j) => {
        if ($(`script[src="${src}"]`))
            return r(true)
        const s = document.createElement('script')
        s.src = src
        s.addEventListener('load', r)
        document.head.appendChild(s)
    })
}
window.loadCSS = src => {
    return new Promise((r, j) => {
        const s = document.createElement('link')
        s.rel = 'stylesheet'
        s.href = src
        s.addEventListener('load', r)
        document.head.appendChild(s)
    })
}
window.wait = ms => new Promise(r => setTimeout(r, ms))
window.data = new Proxy({}, {
    set: (obj, prop, value) => {
        for (const e of $$(`[data*=${prop}]`)) {
            const arr = e.getAttribute('data').split('.')
            arr.shift()
            for (const p of arr) value = value[p]
            e.set ? e.set(value) : e.textContent = value
        }
        return prop
    }
})
window.ready = async () => {
    return new Promise(r => {
        if (document.readyState === 'complete')
            r(true)
        document.onreadystatechange = () => {
            if (document.readyState === 'complete')
                r()
        }
    })
}

class EnigmaticElement extends HTMLElement {
    constructor () {
        super ()
    }
    connectedCallback () {
        if (!this.id) 
            this.id = Math.floor(Math.random() * 5000)
        for (let attr of this.attributes) {
            this[attr.name] = attr.value
        }
        this.innerTemplate = this.innerHTML
    } 
    async show () {
        return new Promise(r => {
            this.hidden = false
            this.classList.remove('hide')
            this.classList.add('show')
            for (const child of this.children) {
                child.classList.remove('hide')
                child.classList.add('show')
            }
            r(true)
        })
    }
    async hide () {
        return new Promise(r => {
            this.classList.remove('show')
            this.classList.add('hide')
            for(const child of this.children) {
              child.classList.remove('show')
              child.classList.add('hide')
            }
            r(true)
        })
    }
    async toggle (classes = ['show', 'hide']) {
        const c = this.classList
        if(!c.contains(classes[0]) && !c.contains(classes[1]))
            c.add(classes[0])
        for(const cls of classes) {
            this.classList.toggle(cls)
        }
    }
    set (s) {
        if(typeof s === 'object') {
            s = JSON.stringify(s)
        }
        this.innerHTML = s
    }
    child (type = 'e-e', id = Math.random()) {
        const child = document.createElement(type)
        child.id = id
        this.appendChild(child)
        return child
    }
    childHTML (html, type = 'e-e', id = Math.random()) {
        const e = this.child(type, id)
        e.innerHTML = html
        return e
    }
}
customElements.define ('e-e', EnigmaticElement)

(async () => {
    await window.ready()
    window.body = document.body
    body.child = (type = 'div', id = Math.random()) => {
        const child = document.createElement(type)
        if (id) child.id = id
        body.appendChild(child)
        return child
    }
    if (window.main) window.main(document)
})()
