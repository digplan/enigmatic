# enigmatic
![version](https://d25lcipzij17d.cloudfront.net/badge.svg?id=js&type=6&v=0.9.20&x2=0)
![size](http://img.badgesize.io/digplan/enigmatic/master/enigmatic.js)

Enigmatic is a JavaScript micro-library for creating web applications using lightweight web components.
It aspires to enable faster web app peformance, better reliabilty, and faster development process. 

Enigmatic uses HTML attributes (directives) with a simple component model and data binding - all on existing HTML, JS, and CSS functionality.
- Minimal JS and CSS core, includes basic components and two way data binding

## Quick Start
Just create an HTML page
````
<script src='//unpkg.com/enigmatic'></script>
<script src='//unpkg.com/enigmatic/elements/hello-world/hello-world.js'></script>
<link href='//unpkg.com/enigmatic.css' rel='stylesheet'>
````

## Enigmatic also includes some helpers
````
 window.$ -- $([body]) // Query Selector
 window.$$ -- $$([div])[0] // Query Selector All
 await window.loadJS('https://.../some.js')
 await window.loadCSS('https://.../some.css')
 await window.wait(1000) // Pause execution
 await window.ready() // Pause until page loads
 body.child(type, id) // Append an element to body
````
Encapsulated components make it possible to not have inlined JS 

But, code can be inlined to run after the page is completely loaded

### window.main
````
 <script>
   main = () => {
     // do something after page is loaded
   }
 </script>
````

## window.data
window.data is a single data object, that holds all the data/state for the app. 
It's a simple object, with each key being an identifier, or *channel* to use with elements that specify the data attribute

Controls set the data object to send and receive data, using a data attribute and .set() method of a custom element
````
<hello-world data='mykey'></hello-world>

<script>
   main = () => data.mykey = 'Hello world!'
</script>
````

One may create a simple counter. In this example, the window.data object takes care of the binding
````
<button onclick='data.count++'>Click me</button>
<simple-counter data='count'>0</simple-counter>

<script>
  main = () => data.count = 0
</script>
````

## Enigmatic element (e-e)
e-e is an element that may be extended to create custom elements

It includes some simple methods
````
hide()
show()
toggle([class1, class2]) - toggle any number of classes
set() = handles window.data object
child(type, id) - append a child element
````

## Simple page layout
Pages are simple grids, and cells may also be grids
Only a couple of directives to lay out the page

## enigmatic.css
Optional CSS with some helper classes
ie.. bg-red, red, center, fixed, margins, padding, etc..

## Custom Elements and the Data object
Custom elements can be created according to the HTML standard, and interact with data without the need for additinal abstractions and sugar

A JSON fetch element, data-source, handles the fetch of data
````
<my-list-element id='mye' data='users.results'></my-list-element>

<data-source href='https://randomuser.me/api' target='users'></data-source>
````