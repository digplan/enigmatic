**Enigmatic.js - Documentation**

*Note: This repository contains a single JavaScript file that exposes a small set of utility functions under the global `w` object.*

**1. Introduction**

Enigmatic.js provides helpers for loading resources, creating custom elements and managing a small reactive state. The library automatically activates once the script is loaded and offers the following features:

- Resource Loading: load JavaScript and CSS files dynamically.
- Custom Elements: quickly define web components with built in event wiring.
- State Management: update DOM elements automatically when state values change.
- Data Handling: fetch JSON on elements with a `fetch` attribute and receive server-sent events via streams.

**2. Helpers**

Several helper functions simplify common tasks:

- `w.$(selector)`: return the first element matching the selector.
- `w.$$(selector)`: return all elements matching the selector.
- `w.loadJS(src)`: dynamically load a JavaScript file.
- `w.loadCSS(src)`: dynamically load a CSS file.
- `w.wait(ms)`: resolve a Promise after `ms` milliseconds.
- `w.ready()`: resolve when the DOM is ready.

**3. Template Flattening**

`w.flatten(obj, text)` replaces placeholders like `{key}` within a template string using data from `obj`.

**4. Custom Elements**

Use `w.e(name, fn = {}, style = {})` to register a custom element. The `fn` object can contain an `init` method and any event handlers (e.g. `click`). The optional `style` object applies inline styles when the element is attached.

**5. State and Reactivity**

- `w.state`: reactive storage backed by a `Proxy`. Updating a key automatically calls any element with a matching `data` attribute and a `set` method.
- `w.stream(url, key)`: subscribe to an EventSource and populate `w.state[key]` with incoming data.

**6. Initialization**

The library runs automatically after loading. It enhances all `<div>` elements with support for the `fetch` attribute which loads JSON and renders it using their inner template.

**7. Global Object**

All helper functions are attached to the global object `w` as well as directly on `window` for convenience.

**8. Usage Example**

```html
<script src="unpkg.com/enigmatic"></script>
<script>
  e('custom-element', {
    init: e => e.innerHTML = 'ready',
    click: ev => console.log('clicked')
  });

  (async () => {
    await ready();
    w.state.example = { key1: 'value1', key2: 'value2' };
  })();
</script>
```

**9. Support**

For bug reports, feature requests, or general inquiries, please visit the GitHub repository of Enigmatic.js.
