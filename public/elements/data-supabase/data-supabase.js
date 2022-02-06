class DataSupabase extends EnigmaticElement {
    attr = {}
    url = ''
    constructor() { 
        super()
    }
    async connectedCallback() {
        for (let attr of this.attributes)
            this.attr[attr.name] = attr.value
        this.headers = {
            'apikey': window.supa_anon,
            'Authorization': `Bearer ${window.supa_anon}`
        }
        this.url = `https://${db}.supabase.co/rest/v1/${t}`
        if (!this.hasAttribute('wait')) {
            console.log(this.id)
            await window.ready()
            this.fetch()
        }
    }
    async fetch() {
        const {db, t, q, key, target, cache} = this.attr
        let json
        const href = `${this.url}?${q}`
        if (cache)
            json = await this.cache(href)
        else
            json = await (await fetch(href, {headers: this.headers})).json()
        if(json.message) throw Error(json.message)
        if (target) window.data[target] = json
    }
    async insert(method = 'POST') {
        let fields = $([target=`${this.id}`]), o = {}
        for(const f in fields)
            o[f.name] = f.value
        const p = {method: method, body: JSON.stringify(o), headers: this.headers}
        let json = await (await fetch(`${this.url}`, p)).json()
        if (json.message) throw Error(json.message)
    }
    async update() {
        return this.insert('PATCH')
    }
    async delete() {
        return this.insert('DELETE')
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