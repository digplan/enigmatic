window.components = {
    "hello-world": (data) => `Hello ${data?.name || 'World'}!`,
    "markdown-block": {
        async init() {
            await loadJS('https://cdn.jsdelivr.net/npm/marked/marked.min.js')
            this.innerHTML = marked.parse(this.innerText)
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