class SideMenu extends EnigmaticElement {
    connectedCallback() {
        this.innerHTML = `
            <e-e id='sm1' style='overflow:hidden; background: radial-gradient(circle, #E5E6E4, #FFF); top: 0; height: 98%; padding: 10px; position: absolute; right: 0; width: 300px'>
                ${$('side-menu').innerHTML}
            </e-e>
        `
        this.opened = false
        this.toggleclasses = this.getAttribute('toggle-classes')?.split(' ') || ['show', 'hide']
        this.classList.add(this.toggleclasses[1])
    }
    toggle() {
        super.toggle(this.toggleclasses)
    }
}
customElements.define('side-menu', SideMenu)
