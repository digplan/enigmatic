# enigmatic
![version](https://d25lcipzij17d.cloudfront.net/badge.svg?id=js&type=6&v=0.8.5&x2=0)
![size](http://img.badgesize.io/digplan/enigmatic/master/main.js)

Enigmatic is a JavaScript micro-library for creating web applications using lightweight web components.
It aspires to enable faster web app peformance, better reliabilty, and faster development process. 

Enigmatic uses HTML attributes (directives) with a simple component model and data binding - all on existing HTML, JS, and CSS functionality.
- No special tooling, compilation or preprocessing, or new languages to learn
- Minimal JS and CSS core, includes basic components and two way data binding

## Quick Start
Just create an HTML page
````
<script src='//unpkg.com/enigmatic'></script>
<link href='//unpkg.com/enigmatic.css' rel='stylesheet'>
````

## Enigmatic also includes some helpers
````
 window.$ -- $([body])[0] // Query Selector All
 window.load -- ('mycontrol.js') // Load JS or CSS
 Element.css -- e.css('color:red') // Add css to an element
 Element.child -- body.child('span') // Add a child element
 
````

## window.data
window.data is a single data object, that holds all the data for the app.  It's a JS object, with each key being an identifier, or *channel* to use with controls that have the data attribute.

Controls interact with the data object to send and receive data, using a data attribute and .set() method.
````
<!-- Just use the *data* attribute
<hellodata data='mykey'></hellodata>
  
window.data.set('mykey', 'Hello world!')
````

One may also create a simple counter, interacting with plain ole (non-control) HTML elements.
In this example, the window.data object and control's data attribute take care of the binding.
````
<button onclick='data.count++'>Click me</button>
<counter data='count'></counter>

data.count = 0
const counter = e =>
  e.innerHTML = 'Ready'
````
