class HelloWorld extends EnigmaticElement {
    render({a}) {
        console.log('props is ' + a)
        
    }
    
    connectedCallback() {
        return this.innerHTML = console.log(this.getAttribute('a'))
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