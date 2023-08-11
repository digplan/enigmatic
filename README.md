**Enigmatic.js - Documentation**

*Note: The code provided is a self-contained JavaScript file that defines a library named Enigmatic.js. The documentation below explains the functions and features available in the library.*

**1. Introduction**

Enigmatic.js is a JavaScript library designed to provide utility functions and tools to simplify common tasks such as loading resources, working with custom elements, managing state, and handling data reactivity. The library aims to enhance web development productivity and offers the following features:

- Resource Loading: Load JavaScript and CSS files dynamically.
- Custom Element: Define custom web components with ease.
- State Management: Easily manage and react to changes in application state.
- Data Handling: Fetch data from remote sources and stream real-time data.

**2. Helpers**

Enigmatic.js provides several helper functions to simplify common tasks:

- `w.$(selector)`: Returns the first element matching the given CSS selector within the document.
- `w.$$(selector)`: Returns a list of all elements matching the given CSS selector within the document.
- `w.loadJS(src)`: Loads a JavaScript file dynamically by creating a script element in the document's head.
- `w.loadCSS(src)`: Loads a CSS file dynamically by creating a link element in the document's head.
- `w.wait(ms)`: Returns a Promise that resolves after the specified number of milliseconds.
- `w.ready()`: Returns a Promise that resolves when the DOM is ready and the document has completed loading.

**3. Template Flattening**

Enigmatic.js provides the `w.flatten(obj, text)` function to template a string using placeholders. The placeholders can be in the form of `{$key}`, `{_key_}`, or `{_val_}`. The function recursively replaces the placeholders with the corresponding keys and values from the provided object.

**4. Custom Element**

Enigmatic.js simplifies the process of defining custom elements with the `w.element(name, options)` function. It takes the following parameters:

- `name` (string): The name of the custom element.
- `options` (object): An object containing configuration options for the custom element.
  - `onMount`: A function to be executed when the custom element is connected to the DOM.
  - `beforeData`: A function to preprocess the data before rendering the template.
  - `style`: A string containing CSS rules specific to the custom element.
  - `template`: A string representing the HTML template for the custom element.

**5. State, Data, and Reactivity**

Enigmatic.js introduces reactive state management with the `w.state` object. It is implemented using a Proxy to reactively update DOM elements when state changes. DOM elements with `data` attributes that match state keys will be automatically updated when the corresponding state changes.

- `w.state`: An object acting as reactive state storage. Changes to this object trigger updates in associated DOM elements with matching `data` attributes.

- `w.save(obj, name)`: Saves a JavaScript object to the local storage under the specified name.
- `w.load(name)`: Loads a JavaScript object from local storage using the given name.
- `w.get(url, options, transform, key)`: Fetches data from a remote URL using the `fetch` API. Transforms the fetched data using the optional `transform` function and updates the state with the specified `key`.
- `w.stream(url, key)`: Sets up an EventSource to stream real-time data from the specified URL and updates the state with the specified `key`.

**6. Startup**

Enigmatic.js provides the `w.start()` function to kickstart the library and process elements on the page with special attributes like `fetch`, `immediate`, and `stream`.

**7. Global Object**

The code creates a global object `w` that holds all the utility functions and state management features.

**8. Usage Example**

To use Enigmatic.js, include the script in your HTML file and call its functions as needed. For example:

```html
<script src="unpkg.com/enigmatic"></script>
<script>
  // Perform custom element registration
  w.element('custom-element', {
    template: '<div>{_key_}: {_val_}</div>',
  });

  // Initialize Enigmatic.js
  (async () => {
    await w.start();
    w.state.exampleData = { key1: 'value1', key2: 'value2' };
  })();
</script>
```

**9. Support**

For bug reports, feature requests, or general inquiries, please visit the GitHub repository of Enigmatic.js.