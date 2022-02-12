class ViewPanel extends EnigmaticElement {
  constructor() {
    super()
  }
  connectedCallback() {
    const browser = navigator.userAgent.toLowerCase()
    const agent = this.attributes['agent']?.value
    if (agent && !browser.match(agent))
      this.remove()
  }
  showOnly(qs) {
    for (const child of this.children) {
      if (child instanceof EnigmaticElement) {
        child[child.matches(qs) ? 'show' : 'hide']()
      } else {
        child.classList.add(child.matches(qs) ? 'show' : 'hide')
        child.classList.remove(child.matches(qs) ? 'hide' : 'show')
      }
    }
  }
}
customElements.define('view-panel', ViewPanel)