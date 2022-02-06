class DataSource extends EnigmaticElement {

    async render({url, target, wait = false}) {
        this.target = target
        this.url = url
        if (!wait) {
          const f = await fetch(this.url = url)
          let json = await f.json()
          window.data[target] = json
        }
    }
    
    failedAuthentication(f) {
        return f.status == '401'
    }
    
    async fetch() {
        const f = await fetch(this.url)
        let json = await f.json()
        window.data[this.target] = json
    }

    async login() {
        let f = await fetch(this.url)
    }
    
    logout() {
        fetch(this.url + '/logout') 
    }
    
}

customElements.define('data-source', DataSource)
