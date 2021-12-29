import * as monaco from 'https://cdn.skypack.dev/monaco-editor@0.23'
customElements.define('monaco-editor', class extends EnigmaticElement {
    connectedCallback() {
        const c = document.createElement('div')
        c.style = this.getAttribute('estyle') || "width: 600px; height: 400px; border: 1px solid gray"
        this.appendChild(c)
        const id = 'me1'
        const codewin = $(`code[for=${id}]`)?.innerHTML || ''
        this.editor = monaco.editor.create(c, {
            value: codewin,
            language: 'javascript'
        })
    }
    set(lang = 'javascript', code){
       this.editor.setModel(monaco.editor.createModel(code, lang))
    }
})

/*

example..

<monaco-editor id='me1' estyle="width: 600px; height: 400px; border: 1px solid gray"></monaco-editor>
<code for='me1' hidden>
    class HelloWorld extends HTMLElement {
      connectedCallback() {
        this.innerHTML = '<div>Hello World!</div>'
      }
    }
    customElements.define('hello-world', HelloWorld)
</code>

*/