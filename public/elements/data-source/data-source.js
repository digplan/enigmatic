class DataSource extends EnigmaticElement {

    async render({href, target, noauth, wait}) {
        this.hide()
        this.href = href
        this.target = target
        if (!wait) {
          await window.ready()
          const f = await fetch(href)
          let json = await f.json()
          window.data[target] = json
        }
    }
    
    failedAuthentication(f) {
        return f.status == '401'
    }
    
    async fetch() {
        const f = await fetch(this.href)
        let json = await f.json()
        window.data[this.target] = json
        console.log(this.target, window.data[this.target])
    }

    async login() {
        let f = await fetch(this.url)
    }
    
    logout() {
        fetch(this.url + '/logout') 
    }
    
}

customElements.define('data-source', DataSource)
