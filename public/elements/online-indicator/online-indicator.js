class OnlineIndicator extends EnigmaticElement {
    connectedCallback() {
        const o = this.getAttribute('online')
        const f = this.getAttribute('offline')
        this.innerHTML = window.navigator.onLine ? (o || '🟢') : (f || '🔴')
        window.addEventListener('online', this.connectedCallback.bind(this))
        window.addEventListener('offline', this.connectedCallback.bind(this))
    }
    async wentOnline() {
        return new Promise(resolve => {
            window.addEventListener('online', resolve)
        })
    }
    async wentOffline() {
        return new Promise(resolve => {
            window.addEventListener('offline', resolve)
        })
    }
}
customElements.define('online-indicator', OnlineIndicator)