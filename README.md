# enigmatic
![Build Status](https://travis-ci.org/digplan/enigmatic.svg?branch=master "")

Enigmatic is a JavaScript micro-library for creating web applications using lightweight web components.
It aspires to enable faster web app development and performance, especially on devices with extremely limited resources or slow network.

## Usage
Can be used as simply as follows.
````
<script src=//tiny.cc/tryenig></script>

<!-- Hello world control -->
<helloworld control></helloworld>
````

Controls are just HTML elements with the attribute *control* added.

Defining a control is as simple as a function.
````
const helloworld = e => e.innerHTML = 'Hello world'
````

Enigmatic also includes some helpers.
````
// $ Query Selector All
$('div').forEach(...)

// Load scripts
async x => await load('https://...')

// Get (fetch) data
async x = await get('//now.httpbin.org')
````

## Data
window.data is a singular global object that holds all data in the app.
Controls interact with the data object to send and receive data, using a data attribute and .set() method.
````
<hellodata data='key' control></hellodata>

hellodata = e =>
  e.set = datain => e.innerHTML = datain
````

One may also create a simple counter, interacting with plain ole (non-control) HTML elements.
In this example, the window.data object and control's data attribute take care of the binding.
````
<button onclick='data.count++'>Click me</button>
<counter data='count' control></counter>

data.count = 0
const counter = e =>
  e.innerHTML = 'Starting'
````

## Meta-data
An HTML Meta tag is introduced, which optionally can be used to instantiate the data object.
````
// This expects a JSON object.  Each property of the object will be used in the app's data object
<meta data='//now.httpbin.org'>
````

# Cheat Sheet
## HTML
````
<!-- Shortcut to instantiate the data for the app -->
<meta data='//now.httpbin.org'>

<!-- Control -->
<controlname [data='key'] control></controlname>

<helloworld></helloworld>
<time></time>
````
## JS
````
// $: const es = $('div')
// load : await load('//tiny.cc/tryenig')
// get : await get('//tiny.cc/tryenig')
// data : window.data
````
