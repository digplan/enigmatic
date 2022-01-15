class DataSupabase extends EnigmaticElement {
    attr = {}
    constructor() { 
        super()
    }
    async connectedCallback() {
        for (let attr of this.attributes)
            this.attr[attr.name] = attr.value
        this.attr.key = window.supa_anon
        if (!this.hasAttribute('wait')) {
            console.log(this.id)
            await window.ready()
            this.fetch()
        }
    }
    async fetch() {
        const {href, key, target, cache} = this.attr
        let hdrs = {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }, json
        if (cache)
            json = await this.cache(href)
        else
            json = await (await fetch(href, {headers: hdrs})).json()
        if(json.message)
            throw Error(json.message)
        if (target)
            window.data[target] = json
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

customElements.define('data-supabase', DataSupabase)