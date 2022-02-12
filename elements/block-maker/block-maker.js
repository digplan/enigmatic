class BlockMaker extends EnigmaticElement {

    async connectedCallback() {
        let numblocks = this.getAttribute('num')
        while(numblocks--) {
            let ch = document.createElement('e-e')
            document.body.appendChild(ch)
            ch.style.backgroundColor = '#' + Math.floor(Math.random() * 16777215).toString(16)
        }
        this.style.display = 'none'
    }

}

customElements.define('block-maker', BlockMaker)
