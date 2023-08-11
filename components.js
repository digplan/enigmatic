window.components = {
    "markdown-block": {
        async init() {
            await loadJS('https://cdn.jsdelivr.net/npm/marked/marked.min.js')
            this.innerHTML = marked.parse(this.innerText)
        }
    }
}