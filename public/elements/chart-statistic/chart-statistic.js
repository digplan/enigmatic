class ChartStatistic extends EnigmaticElement {

    async connectedCallback() {
        const units = this.getAttribute('units')
        this.innerHTML = `
            <style>
                chart-statistic {
                    text-transform: uppercase;
                    align-items: center;
                    display: inline-flex;
                    flex-direction: column;
                }
                .chart-statistic-value {
                    font-size: 2.5em;
                    font-weight: bold;
                }
                .chart-statistic-units {
                    font-size: 1.5em;
                    font-weight: normal;
                }
            </style>

            <div class="chart-statistic-value">${this.getAttribute('default')||'0'}</div>
            <div class="chart-statistic-units">${this.getAttribute('units')}</div>
        `
    }

    set(newdata) {
        this.children[1].innerText = newdata
    }

}

customElements.define('chart-statistic', ChartStatistic)