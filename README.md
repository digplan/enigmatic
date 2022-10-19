# enigmatic
Front end framework

## Usage HTML
````html
<script src='https://unpkg.com/enigmatic'></script>
````

## Usage CSS
````html
<link rel=stylesheet href='https://unpkg.com/enigmatic/enigmatic.css'>
````

## Layout
```html
<body style="--cols:1fr 1fr 1fr 10fr; --rows:1fr 10fr">
<section style="--cols:1fr 10fr; --rows:1fr 10fr">
```

## Helpers
````js
$('.myclass') - document.querySelector

$$('.myclass') - document.querySelectorAll

loadJS('https://..') - load a js script

loadCSS('https://..') - load a css file

await wait(1000) - sleep

await ready() - wait for page to load
````

## State
A global to the page map, that provides reactivity

Use the data attribute in HTML elements
````html
<div data='mydata'>Hello {name}</div>

<script>
  state.mydata = {name: 'World'}
</script>
````
or in a custom element
````html
<script>
  element('my-element', { template: 'Hello {name}' })
</script>

<my-element data='mydata'></my-element>

<script>
  state.mydata = {name: 'World'}
</script>
````
Custom element using class syntax
````js
customElements.define('my-element', class MyElement extends HTMLElement {
    set (data) {
        console.log('setting data')
        // ???
    }
})
````
## Flatten
````js
flatten(obj, text)
````
Templated text. Allows use of an object, or object array with string or object value.

Object
````html
    <div data="testobj" style='--span: 4' preserve='true'>
        {k1} {k2}
    </div>

    state.data
````
All keys and values
````html
    <div data="testobjkv" style='--span: 4' preserve='true'>
        {$key} {$val}
    </div>
````
Object array with string values
````html
    <div data="testarray" style='--span: 4' preserve='true'>
        {$key}: {name}={value}
    </div>
````
Object array with object values
````html
    <div data="testobjobj" style='--span: 4' preserve='true'>
        {$key}: {name}={value}
    </div>
````
## Get
Alias for fetch, https only
````js
await get(url, options = {}, transform, key)

const tf = obj => { obj.name = 'cb'; return obj }

await get('https://my.server.com/api', {body: JSON.stringify({'my':'data'}), tf, 'mykey'})
````

## Stream
Alias for EventSource
````js
stream(url, statekey)
stream('https://my.websocket.server.com', 'mykey')
````

## Components
````html
<script src='components.js'></script>
````
Components allow for a collection of custom elements in one file, using a format like this:
````js
window.components = {
    'hello-world': {
        style: 'color: red',
        onMount: async x => console.log('mounted h-w'),
        template: 'Hello World'
    },
    'random-users': {
        template: 'Hello Random user: {results[0].name.first} {results[0].name.last}',
        onMount: e => console.log('Mounted', e.tagName, e.props),
        beforeData: x => x.results[0].name.first = 'John'
    },
    'tailwind-example': {
        template: '<div class="bg-blue-300 text-white font-bold py-2 px-4 rounded">I am Tailwind</div>',
        onMount: async e => await loadCSS('https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css')
    }
}
````
Custom element definitions are provided with the name of the element, style, onMount function, and text template for the element.

An optional beforeData can be provided to process the data beforehand to fit the template.

## Element
Element can be used to define these components in script.
````js
  element('element-name', { onMount, beforeData, style, template })
````
For instance,
````js
  const options = {}
  options.onmount = () => console.log('mounted')
  options.beforeData = obj => obj
  options.style = 'color:red'
  options.template = 'Hello {name}'

  element('my-element', options)
````