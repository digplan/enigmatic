class DataSource extends EnigmaticElement {
    
    needsAuthentication = true
    url = ''
    target = ''

    async connectedCallback() {
        this.hide()
        const url = this.getAttribute('href')
        const target = this.getAttribute('target')
        this.needsAuthentication = !this.hasAtttribute('noauth')
        const isWait = this.hasAttribute('wait')
        if (!isWait)
            await this.main()
    }
    
    async main() {
        await window.ready()
        this.fetch()
    }
    
    failedAuthentication(f) {
        return f.status == '401'
    }
    
    async fetch() {
        let f = await fetch(this.url)
        if(this.needsAuthentication && this.failedAuthentication(f)) {
            return this.show()
        }
        const json = await f.json()
        if (target)
            window.data.set(this.target, json)
    }

    login() {
        let f = await fetch(this.url)
    }
    
    logout() {
        fetch(this.url + '/logout) 
    }
    
}

customElements.define('data-source', DataSource)
