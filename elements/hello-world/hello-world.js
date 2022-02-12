class HelloWorld extends EnigmaticElement {

    render({name}) {

        this.innerHTML = `
            <style>
                hello-world > h1 {
                    padding: 1em;
                    color: white; 
                    background: linear-gradient(to left, red, yellow, green, blue, violet) 
                }
            </style>
            <h1>Hello ${name}!</h1>
        `

    }

}

customElements.define('hello-world', HelloWorld)