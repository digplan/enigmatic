class DataStream extends EnigmaticElement {
    eventSource = null
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
        const url = this.getAttribute('href') || Error('Data stream needs a href')
        const target = this.getAttribute('target') || Error('Data stream needs a target')
        this.eventSource = new EventSource(url)
        this.eventSource.onmessage = (e) => {
            let d = e.data
            try { d = JSON.parse(d) } catch(c) {}
            console.log(d)
            data.set(target, d)
        }
    }
}

customElements.define('data-stream', DataStream)