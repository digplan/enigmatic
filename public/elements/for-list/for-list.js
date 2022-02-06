class ForList extends EnigmaticElement {
    render() {
        this.innerTemplate = this.innerHTML
        this.innerHTML = ''
        console.log(1)
    }
    set(array) {
        for (const rec of array) {
            let addhtml = this.innerTemplate
            for(const m of addhtml.match(/\{\{(.*?)\}\}/g)) {
                const dest = m.replace(/{{|}}/g,'').split('.')
                let k, val = rec
                while(k = dest.shift()) {
                    val = val[k]
                }
                addhtml = addhtml.replace(m, val)
            }
            this.innerHTML += addhtml
        }
    }
}

customElements.define("for-list", ForList)