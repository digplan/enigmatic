class AlertBox extends EnigmaticElement {

  url = 'https://cdn.tailwindcss.com'

  async connectedCallback() {
    loadJS(this.url)
    this.innerHTML = `<div style='width: 60%' class="fixed margins
    ${this.getAttribute('position')} py-3 px-5 mb-4 ${this.getAttribute('tw-color')} text-blue-900 text-sm rounded-md border">
    ${this.getAttribute('text')}</div>`
    this.hide()
  }

  show() {
    super.show()
    setTimeout(this.hide.bind(this), this.getAttribute('timeout')||3000)
  }

}
customElements.define('alert-box', AlertBox)