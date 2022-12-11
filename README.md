# enigmatic
![version](https://d25lcipzij17d.cloudfront.net/badge.svg?id=js&type=6&v=0.8.5&x2=0)
![size](http://img.badgesize.io/digplan/enigmatic/master/main.js)

Enigmatic is a JavaScript micro-library for creating web applications using lightweight web components.
It aspires to enable faster web app peformance, better reliabilty, and faster development process. 

Enigmatic uses HTML attributes (directives) with a simple component model and data binding - all on existing HTML, JS, and CSS functionality, instead of complicated frameworks.
- No special tooling required
- No compilation or preprocessing
- No new languages to learn
- Small 4k JS core, includes basic component framework and two way data binding

## Single page web application (SPA) with standard HTML/CSS grid layout
Simple Web component based model with basic UI components
App data store with two-way component data binding
Data fetch and streamable event-source updates

Enigmatic was created to deal with the problems of web application development that has evolved over the 20 years.

- Applications are built with various tooling and frameworks, making them too complicated to be secure, reliable, and fast
- They are very expensive to develop and maintain, because of the expertise of several frameworks and tools required

## Quick Start
Just create an HTML page
````
<script src='//unpkg.com/enigmatic'></script>
<link href='//unpkg.com/enigmatic.css' rel='stylesheet'>

<style>
  body {
    grid-template-columns: 10% auto 20%;
    grid-template-rows: auto 1fr 10%;
    gap: 4px;
  }
</style>

<body class='bg-black' debug>
  
  <div class='bg-yellow'></div>
  <div class='bg-yellow'></div>
  <div class='bg-yellow'>222</div>
  <div class='bg-yellow'>222</div>
  <div class='bg-yellow'>222</div>
  <div class='bg-yellow'>222</div>
  <div class='bg-yellow'>222</div>
  <div class='bg-yellow'>222</div>
  <div class='bg-yellow'>222</div>
  
</body>
````

Web components are called controls.  A Hello World control is included. an be used as simply as follows.
````
<script src='//unpkg.com/enigmatic'></script>

<!-- Hello world control -->
<helloworld control></helloworld>
````

Controls are just HTML elements with the attribute *control* added.
Defining a control is as simple as a function.
````
window.controls.helloworld = (e) => e.innerHTML = 'Hello world'
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
<hellodata data='mykey' control></hellodata>

hellodata = e =>
  e.set = (datain) => e.innerHTML = datain
  
window.data.mykey = 'Hello world!' // Puts Hello world! in the inner HTML of the control
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

## window.classes
Classes can be defined which add functionality to a control. A class, print, is included
````
// The print class brings up the print dialog when selected
<helloworld class='print' control></helloworld>
````

## helloworld
A hello world control is included
````
<helloworld control></helloworld>
````

## Debug
Processing can be debugged by just adding the debug attribute to the body tag
````
<body debug>
````
