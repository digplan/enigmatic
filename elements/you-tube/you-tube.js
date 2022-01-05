class YouTube extends EnigmaticElement {
    connectedCallback() {
        this.uid = this.getAttribute('uid') || 'Fku7hi5kI-c'
        this.innerHTML = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${this.uid}" 
            title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; 
            encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    }
}
customElements.define('you-tube', YouTube)