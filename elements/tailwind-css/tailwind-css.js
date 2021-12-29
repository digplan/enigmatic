class TailwindCSS extends HTMLElement {

  url = 'https://cdn.tailwindcss.com'

  connectedCallback() {
     this.style.display = 'none'
     loadJS(this.url)
  }

}
customElements.define('tailwind-css', TailwindCSS)