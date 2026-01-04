window.components = {
    "hello-world": (data) => `Hello ${data?.name || 'World'}!`,
    "markdown-block": {
        async init() {
            await loadJS('https://cdn.jsdelivr.net/npm/marked/marked.min.js')
            this.innerHTML = marked.parse(this.innerText)
        }
    },
    "auto-complete": {
        init() {
            // Prevent re-initialization
            if (this._initialized) return
            this._initialized = true
            
            // Ensure element is visible
            this.style.display = 'block'
            this.style.width = '100%'
            this.style.minWidth = '200px'
            this.style.margin = '10px 0'
            this.style.padding = '0'
            this.style.backgroundColor = 'transparent'
            
            this.input = document.createElement('input')
            this.input.type = 'text'
            this.input.placeholder = this.getAttribute('placeholder') || 'Type to search...'
            this.input.style.cssText = 'width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;box-sizing:border-box;font-size:14px;'
            
            this.dropdown = document.createElement('div')
            this.dropdown.style.cssText = 'position:absolute;top:100%;left:0;right:0;background:white;border:1px solid #ccc;border-top:none;max-height:200px;overflow-y:auto;z-index:1000;display:none;box-shadow:0 2px 4px rgba(0,0,0,0.1);'
            
            this.container = document.createElement('div')
            this.container.style.cssText = 'position:relative;width:100%;min-width:200px;'
            this.container.appendChild(this.input)
            this.container.appendChild(this.dropdown)
            
            // Clear existing content
            this.innerHTML = ''
            this.appendChild(this.container)
            
            this.items = []
            this.filtered = []
            this.selectedIndex = -1
            
            this.input.addEventListener('input', () => this.filter())
            this.input.addEventListener('keydown', (e) => this.handleKey(e))
            this.input.addEventListener('focus', () => {
                if (this.filtered.length > 0) this.dropdown.style.display = 'block'
            })
            
            // Use a unique handler per instance
            this._clickHandler = (e) => {
                if (!this.contains(e.target)) {
                    this.dropdown.style.display = 'none'
                }
            }
            document.addEventListener('click', this._clickHandler)
        },
        set(data) {
            this.items = Array.isArray(data) ? data : (data?.items || [])
            this.filter()
        },
        filter() {
            const query = this.input.value.toLowerCase()
            this.filtered = this.items.filter(item => {
                const text = typeof item === 'string' ? item : (item.label || item.name || String(item))
                return text.toLowerCase().includes(query)
            })
            this.render()
        },
        render() {
            if (this.filtered.length === 0) {
                this.dropdown.style.display = 'none'
                return
            }
            
            this.dropdown.innerHTML = this.filtered.map((item, i) => {
                const text = typeof item === 'string' ? item : (item.label || item.name || String(item))
                const selected = i === this.selectedIndex ? 'background:#f0f0f0;' : ''
                return `<div data-index="${i}" style="padding:8px;cursor:pointer;${selected}">${text}</div>`
            }).join('')
            
            this.dropdown.style.display = 'block'
            
            this.dropdown.querySelectorAll('div').forEach((div, i) => {
                div.addEventListener('click', () => this.select(i))
                div.addEventListener('mouseenter', () => {
                    this.selectedIndex = i
                    this.render()
                })
            })
        },
        select(index) {
            const item = this.filtered[index]
            const text = typeof item === 'string' ? item : (item.label || item.name || String(item))
            this.input.value = text
            this.dropdown.style.display = 'none'
            this.selectedIndex = -1
            
            const event = new CustomEvent('select', { detail: item })
            this.dispatchEvent(event)
        },
        handleKey(e) {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                this.selectedIndex = Math.min(this.selectedIndex + 1, this.filtered.length - 1)
                this.render()
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1)
                this.render()
            } else if (e.key === 'Enter' && this.selectedIndex >= 0) {
                e.preventDefault()
                this.select(this.selectedIndex)
            } else if (e.key === 'Escape') {
                this.dropdown.style.display = 'none'
                this.selectedIndex = -1
            }
        }
    }
}

/**
 * Component Definitions
 * 
 * Components are registered via window.components object.
 * Each component is a custom HTML element that can be used in your HTML.
 * 
 * Structure:
 *   window.components = {
 *     "component-name": {
 *       // Component methods and properties
 *     }
 *   }
 * 
 * Available Options:
 * 
 * 1. init(element) - Called when component is first connected to DOM
 *    - Receives the element instance as parameter
 *    - Use for setup, loading resources, initial rendering
 *    - Can be async
 * 
 * 2. set(data) - Called when component receives data (via data attribute binding)
 *    - Receives data object from state or fetch
 *    - Use to update component content based on data
 * 
 * 3. click(ev), mouseover(ev), etc. - Event handlers
 *    - Automatically bound as event listeners
 *    - Any method matching /click|mouseover/ pattern is auto-bound
 *    - Receives the event object
 * 
 * 4. style - Object with CSS properties
 *    - Applied as inline styles when component connects
 *    - Use camelCase or kebab-case (with quotes) for CSS properties
 * 
 * 5. Any other methods - Available as instance methods
 *    - Can be called directly on element: element.myMethod()
 * 
 * Usage in HTML:
 *   <component-name data="stateKey"></component-name>
 * 
 * Example:
 *   window.components = {
 *     "my-button": {
 *       init: (e) => e.innerText = 'Click me',
 *       click: (ev) => alert('Clicked!'),
 *       style: { color: 'blue', padding: '10px' }
 *     }
 *   }
 */