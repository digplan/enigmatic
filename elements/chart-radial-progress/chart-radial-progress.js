class ChartRadialProgress extends EnigmaticElement {
    constructor() {
        super()
        loadCSS('chart-radial-progress.css')
    }
    set(v) {
        console.log(v)
        this.innerHTML = v + this.getAttribute('symbol')
        this.style = `--data:${v}`
    }
}

customElements.define('chart-radial-progress', ChartRadialProgress)
