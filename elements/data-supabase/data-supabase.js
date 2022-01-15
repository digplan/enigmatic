class DataSource extends EnigmaticElement {
    constructor() {
        super()
    }
    async connectedCallback() {
        const isWait = this.hasAttribute('wait')
        if (!isWait)
            await this.main()
    }
    async main() {
        await window.ready()
        this.fetch()
    }
    async fetch() {
        const url = this.getAttribute('href')
        if(!url) return
        const target = this.getAttribute('target')
        const key = window.supa_anon
        let json
        let hdrs = {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
        if (this.hasAttribute('cache'))
            json = await this.cache(url)
        else
            json = await (await fetch(url, {headers: hdrs})).json()
        if (target)
            window.data.set(this.getAttribute('target'), json)
    }
    async cache(url) {
        const cached = localStorage.getItem(url)
        if (cached)
            return JSON.parse(cached)
        const json = await (await fetch(url)).json()
        localStorage.setItem(url, JSON.stringify(json))
        return json
    }
}

customElements.define('data-source', DataSource)