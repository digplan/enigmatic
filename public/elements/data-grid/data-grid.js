class DataGrid extends EnigmaticElement {

    async connectedCallback() {
        const key = this.getAttribute('data')
        const rows = this.getAttribute('rows')
        const cols = this.getAttribute('cols')
        const pid = this.getAttribute('id')
        this.style.display = 'grid'
        this.style.gridTemplateColumns = `repeat(${cols}, 1fr)`
        this.style.gridTemplateRows = `repeat(${rows}, 1fr)`
        this.innerHTML += `
          <style>
            cell {
                width: 10rem;
                padding: 0.5rem;
            }
          </style>`
        let html = ''
        for (let rn=0; rn<rows; rn++) {
            for(let cn=0; cn<cols; cn++) {
                html += `<cell id='${pid}-c${cn}r${rn}'>${cn}, ${rn}</cell>`
            }
        }
        this.innerHTML = html
    }

    set(newdata) {
        /*
        for(const header, const cn of Object.keys(newdata[0])){
            const id = `${this.id}-c${cn}r0`
            $(`#${id}`).innerHTML = header
            console.log(`#${id}`)
        }
        */
    }

 }

customElements.define('data-grid', DataGrid)
