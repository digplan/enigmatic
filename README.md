**Enigmatic.js - Documentation**

*Note: This repository contains a single JavaScript file that exposes a small set of utility functions under the global `w` object.*

**1. Introduction**

Enigmatic.js provides helpers for loading resources, creating custom elements and managing a small reactive state. The library automatically activates once the script is loaded and offers the following features:

- Resource Loading: load JavaScript files dynamically
- Custom Elements: quickly define web components with built-in event wiring
- State Management: update DOM elements automatically when state values change
- Data Handling: fetch JSON on elements with a `fetch` attribute and receive server-sent events via streams
- Error Handling: automatic error display for JavaScript errors and promise rejections
- Template Engine: powerful templating with support for nested properties and special variables

**2. Helpers**

Several helper functions simplify common tasks:

- `w.$(selector)`: return the first element matching the selector
- `w.$$(selector)`: return all elements matching the selector
- `w.loadJS(src)`: dynamically load a JavaScript file (returns Promise)
- `w.wait(ms)`: resolve a Promise after `ms` milliseconds
- `w.ready()`: resolve when the DOM is ready
- `w.get(url, opts, transform, key)`: fetch JSON from URL, optionally transform and store in state

**3. Template Flattening**

`w.flatten(obj, text)` replaces placeholders like `{key}` within a template string using data from `obj`.

**Basic usage:**
```javascript
w.flatten({ name: 'John', age: 30 }, 'Hello {name}, age {age}')
// Returns: "Hello John, age 30"
```

**Nested properties:**
```javascript
w.flatten({ user: { name: 'John' } }, 'Hello {user.name}')
// Returns: "Hello John"
```

**Arrays:**
```javascript
w.flatten([{ name: 'John' }, { name: 'Jane' }], 'Name: {name}')
// Returns: "Name: JohnName: Jane"
```

**Special variables for iteration:**
- `{$key}` - current key/index
- `{$val}` - current value
- `{$index}` - array index (for arrays)

```javascript
// For objects
w.flatten({ k1: 'val1', k2: 'val2' }, '{$key}: {$val}')
// Returns: "k1: val1k2: val2"

// For arrays
w.flatten(['a', 'b'], '{$index}: {$val}')
// Returns: "0: a1: b"
```

**4. Custom Elements**

Use `w.e(name, fn, style)` to register a custom element.

**With object configuration:**
```javascript
w.e('my-element', {
  init: (e) => e.innerText = 'ready',
  click: (ev) => console.log('clicked'),
  set: (data) => { /* handle data updates */ }
}, {
  color: 'red',
  padding: '10px'
})
```

**With function (simplified):**
```javascript
w.e('my-element', (data) => `<div>${data.name}</div>`)
// Automatically creates a set() method that updates innerHTML
```

The `fn` parameter can be:
- An object with methods (`init`, `set`, event handlers like `click`, `mouseover`)
- A function that receives data and returns HTML string

Event handlers matching `/click|mouseover/` are automatically bound as event listeners.

**5. State and Reactivity**

- `w.state`: reactive storage backed by a `Proxy`. Updating a key automatically calls `set()` on any element with a matching `data` attribute.

```javascript
w.state.users = [{ name: 'John' }]
// All elements with data="users" will have their set() method called
```

- `w.state._all`: returns the entire state object
- `w.stream(url, key)`: subscribe to an EventSource and populate `w.state[key]` with incoming data

**6. Data Binding on Divs**

The library automatically enhances all `<div>` elements with data binding capabilities:

**Basic usage:**
```html
<div data="users" fetch="https://api.example.com/users">
  <div>{name} - {email}</div>
</div>
```

**Attributes:**
- `data="key"` - binds to `w.state[key]`, updates when state changes
- `fetch="url"` - fetch JSON from URL and render with template
- `fetch='{"inline": "json"}'` - use inline JSON instead of URL
- `defer` - skip automatic fetch on init (call `element.fetch()` manually)
- `t="transform"` - transform function as string (e.g., `t="d=>d.results"`)

**IGNORE blocks:**
```html
<div>
  Hello {name}
  <!--IGNORE-->
  This won't be in the template
  <!--ENDIGNORE-->
</div>
```

**7. Error Handling**

Enigmatic.js automatically displays JavaScript errors and unhandled promise rejections as a red banner at the top of the page, showing the error message and location.

**8. Component Registration via window.components**

You can also register components via `window.components`:

```javascript
window.components = {
  "my-component": {
    init: async () => {
      // initialization
    },
    set: (data) => {
      // handle data
    },
    click: (ev) => {
      // click handler
    },
    style: { color: 'blue' } // optional styles
  }
}
```

See `components.js` for examples.

**9. Usage Examples**

**Basic example:**
```html
<script src="enigmatic.js"></script>
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

**Data binding example:**
```html
<div data="users" fetch="https://api.example.com/users">
  <div>{name} - {email}</div>
</div>

<script>
  // State updates automatically update the div
  w.state.users = [{ name: 'John', email: 'john@example.com' }];
</script>
```

**Component with function:**
```html
<script>
  e('user-card', (data) => `
    <div class="card">
      <h3>${data.name}</h3>
      <p>${data.email}</p>
    </div>
  `);
</script>

<user-card data="currentUser"></user-card>
```

**10. Testing**

The library includes comprehensive headless tests using Jest:

```bash
npm test          # Run tests once
npm run test:watch # Run tests in watch mode
```

**11. Global Object**

All helper functions are attached to the global object `w` as well as directly on `window` for convenience.

**12. Support**

For bug reports, feature requests, or general inquiries, please visit the GitHub repository of Enigmatic.js.
