# enigmatic
![Build Status](https://travis-ci.org/digplan/enigmatic.svg?branch=master "")
[![GitHub package version](https://img.shields.io/github/package-json/v/badges/shields.svg)](https://github.com/digplan/enigmatic/main.js)
![Size](http://img.badgesize.io/digplan/enigmatic/master/main.js)

Enigmatic is a JavaScript micro-library for creating web applications using lightweight web components.
It aspires to enable faster web app development and performance, especially on devices with extremely limited resources or slow network.

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
$('div').forEach(...)
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

## Meta-data
An HTML Meta tag, optionally can be used to instantiate the data object.
````
// This expects a JSON object.  Each property of the object will be used in the app's data object
<meta data='//now.httpbin.org'>
````

# Cheat Sheet
## HTML
````
<!-- Shortcut to instantiate the data for the app -->
<script src=//unpkg.com/enigmatic ></script>
<meta data='//now.httpbin.org'>

<!-- Control spec -->
<controlname [data='key'] control></controlname>

<helloworld></helloworld>
<time></time>
````
