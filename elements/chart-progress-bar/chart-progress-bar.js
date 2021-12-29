class ProgressBar extends EnigmaticElement {
    connectedCallback() {
        this.innerHTML = `<progress id="file" value="${this.getAttribute('value')}" max="${this.getAttribute('max')}"></progress>`
    }
    set(v) {
        this.children[0].value = v
    }
}
customElements.define('progress-bar', ProgressBar)