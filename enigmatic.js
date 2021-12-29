// e-e
window.$ = document.querySelector.bind(document)
window.$$ = document.querySelectorAll.bind(document)
window.body = document.body

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

class Data {
    _ = {}
    set (name= new Error('data.set() needs a name'), value) { 
        this._[name] = value
        for(const e of $$(`[data*=${name}]`)) {
            let v = this._
            for(const k of e.getAttribute('data').split('.')) {
                v = v[k]
            }
            e.set ? e.set(v) : e.textContent = v
        }
        const ret = {}
        ret[name] = value
        return ret
    }
}

window.data = new Data ()
window.wait = ms => new Promise(r => setTimeout(r, ms))

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

window.addEventListener('DOMContentLoaded', (event) => {
    window.body = document.body
    body.child = (type, id) => {
        const child = document.createElement(type)
        if(id) child.id = id
        body.appendChild(child)
        return child
    }
    if(window.main) window.main(document)
})

window.ready = async () => {
    return new Promise(r => {
        if(document.readyState === 'complete')
            r(true)
        document.onreadystatechange = () => {
            if (document.readyState === 'complete')
                r()
        }
    })
}