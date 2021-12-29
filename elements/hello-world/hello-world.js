class HelloWorld extends EnigmaticElement {
    connectedCallback() {
        this.innerHTML = `
            <style>
                hello-world > h1 {
                    padding: 1em;
                    color: white; 
                    background: linear-gradient(to left, red, yellow, green, blue, violet) 
                }
            </style>
            <h1>${this.getAttribute('message')||'Hello World!'}</h1>
        `;
    }
}

customElements.define('hello-world', HelloWorld)