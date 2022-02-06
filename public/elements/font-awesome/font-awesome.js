class FontAwesome extends HTMLElement {
    async connectedCallback() {
        await loadCSS('//cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta2/css/all.min.css')
        this.innerHTML = `<i class="${this.getAttribute('icon')}"></i>`
        this.currentIcon = this.getAttribute('icon')
    }
    set (icon) {
        this.children[0].setAttribute('class', icon)
    }
}
customElements.define('font-awesome', FontAwesome)
