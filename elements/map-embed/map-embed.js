class MapEmbed extends EnigmaticElement {
    connectedCallback() {
        const where = this.getAttribute('where')
        const zoom = this.getAttribute('zoom')
        this.innerHTML = `<iframe width="600" height="500" id="gmap_canvas" src="https://maps.google.com/maps?q=${where||'Chicago'}&t=&z=${zoom||14}&ie=UTF8&iwloc=&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe><style>.mapouter{position:relative;text-align:right;height:500px;width:600px;}</style>`
    }
}

customElements.define("map-embed", MapEmbed)