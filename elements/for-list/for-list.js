class ForList extends EnigmaticElement {
    render({debug}) {
        this.hidden = true
        this.template = this.innerHTML
        this.debug = debug
    }
    set(array) {
        const template = this.innerHTML
        this.innerHTML = ''
        for (const rec of array) {
            const func = new Function('rec', 'return `' + template + '`')
            this.innerHTML += func(rec)
        }
        this.hidden = false
    }
}

customElements.define("for-list", ForList)