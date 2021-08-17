# enigmatic
![version](https://d25lcipzij17d.cloudfront.net/badge.svg?id=js&type=6&v=0.8.5&x2=0)
![size](http://img.badgesize.io/digplan/enigmatic/master/main.js)

Enigmatic is a JavaScript micro-library for creating web applications using lightweight web components.
It aspires to enable faster web app development and performance. Enigmatic focuses on using languages rather than learning complicated frameworks.

Uses a single page web application (PWA) with standard HTML/CSS grid layout
Simple Web component based model with basic UI components
Global app data store with two-way component data binding
Data fetch and streamable event-source updates

## Usage
Can be used as simply as follows.
````
<script src=//unpkg.com/enigmatic></script>

<!-- Hello world control -->
<helloworld control></helloworld>
````

Controls are just HTML elements with the attribute *control* added.
Defining a control is as simple as a function.
````
const helloworld = e => e.innerHTML = 'Hello world'
````

## Enigmatic also includes some helpers.
## window.$
````
// $ = Query Selector All
````
## window.load
````
// Load = load js or css files
await load('https://...')
````
## window.data
window.data is the single data object, that holds all data in the app.  It's a JS object, with each key being an identifier, or *channel* to use with controls that have the data attribute.

Controls interact with the data object to send and receive data, using a data attribute and .set() method.
````
<!-- Just use the *data* attribute
<hellodata data='key' control></hellodata>

hellodata = e =>
  e.set = datain => e.innerHTML = datain
  
window.data = 'Hello world!' // Puts Hello world! in the inner HTML of the control
````

One may also create a simple counter, interacting with plain ole (non-control) HTML elements.
In this example, the window.data object and control's data attribute take care of the binding.
````
<button onclick='data.count++'>Click me</button>
<counter data='count' control></counter>

data.count = 0
const counter = e =>
  e.innerHTML = 'Ready'
````

## window.controls
````
window.controls // holds all the control definitions
````

## helloworld
A hello world control is included
````
<helloworld control></helloworld>
````

## Element.child
A simple helper for creating controls is included
````
window.controls.mycontrol = e => {
  const childElement = e.child('input')
}
````

## Element.css
A simple helper for creating controls is included
````
childElement.css('color: red')
````

## Datasrc, Events, debug Attributes
````
// Get data from data api
<body datasrc='https://mydata.com/api/data'>

// Get Eventsource streaming data
<body events='https://mydata.com/api/stream'>

// Debug the enigmatic processing
<body debug>
````

## CSS Helpers
````
<body bg-color='black'>
````

## Control classes
````
<helloworld class='print' control></helloworld>
````
