# client.js Documentation

## Overview

`client.js` is a client-side JavaScript library that provides utilities for DOM manipulation, reactive state management, and API interactions with a backend server. It automatically initializes custom HTML elements and provides a simple API for key-value storage, file operations, and authentication.

## Core Utilities

### DOM Selectors

```javascript
window.$   // Alias for document.querySelector
window.$$  // Alias for document.querySelectorAll
window.$c  // Alias for element.closest (requires $0 context)
```

**Usage:**
```javascript
const element = window.$('#my-id');
const elements = window.$$('.my-class');
```

### API Base URL

```javascript
window.api_url = "https://localhost:3000"
```

Configures the base URL for all API requests. Modify this to point to your server.

## Reactive State Management

`window.state` is a Proxy object that automatically updates DOM elements when properties change.

**How it works:**
- Set a property: `window.state.myKey = 'value'`
- Elements with `data="myKey"` attribute are automatically updated
- The system looks for custom element handlers in `window.custom[tagName]`
- Supports both function and object-based custom elements

**Example:**
```html
<div data="message">Initial</div>
<script>
  window.state.message = "Updated!"; // Automatically updates the div
</script>
```

**Custom Element Integration:**
- If `window.custom[tagName]` is a function: calls `f(value)` and sets `innerHTML`
- If `window.custom[tagName]` is an object: calls `f.render(value)` and sets `innerHTML`

## API Functions

All API functions are async and return Promises. They use `window.api_url` as the base URL.

### KV Storage Operations

#### `window.get(key)`
Retrieves a value from the server's key-value store.

```javascript
const value = await window.get('my-key');
```

**HTTP Method:** GET  
**Endpoint:** `{api_url}/{key}`  
**Returns:** Parsed JSON response

#### `window.set(key, value)`
Stores a value in the server's key-value store.

```javascript
await window.set('my-key', 'my-value');
await window.set('my-key', { json: 'object' });
```

**HTTP Method:** POST  
**Endpoint:** `{api_url}/{key}`  
**Body:** String values sent as-is, objects are JSON stringified  
**Returns:** Parsed JSON response

#### `window.delete(key)`
Deletes a key from the server's key-value store.

```javascript
await window.delete('my-key');
```

**HTTP Method:** DELETE  
**Endpoint:** `{api_url}/{key}`  
**Returns:** Parsed JSON response

### R2 Storage Operations (File Storage)

#### `window.put(key, body)`
Uploads a file or data to R2 storage.

```javascript
await window.put('filename.txt', 'file content');
await window.put('image.png', blob);
await window.put('data.json', { json: 'data' });
```

**HTTP Method:** PUT  
**Endpoint:** `{api_url}/{key}`  
**Body:** Accepts Blob, string, or JSON-serializable objects  
**Returns:** Parsed JSON response

#### `window.purge(key)`
Deletes a file from R2 storage.

```javascript
await window.purge('filename.txt');
```

**HTTP Method:** PURGE  
**Endpoint:** `{api_url}/{key}`  
**Returns:** Parsed JSON response

#### `window.list()`
Lists all files in the current user's R2 storage.

```javascript
const files = await window.list();
// Returns: [{ name: 'file1.txt', lastModified: '...', size: 123 }, ...]
```

**HTTP Method:** PROPFIND  
**Endpoint:** `{api_url}/` (base URL, no key)  
**Returns:** Array of file objects with `name`, `lastModified`, and `size` properties

#### `window.download(key)`
Downloads a file from R2 storage and triggers browser download.

```javascript
await window.download('filename.txt');
```

**HTTP Method:** PATCH  
**Endpoint:** `{api_url}/{key}`  
**Behavior:** 
- Fetches file as blob
- Creates temporary download URL
- Triggers browser download
- Cleans up temporary URL

**Note:** Uses PATCH method due to browser limitations with custom HTTP methods.

### Authentication

#### `window.login()`
Redirects to the server's login endpoint.

```javascript
window.login();
```

**Behavior:** Sets `window.location.href` to `{api_url}/login`

#### `window.logout()`
Redirects to the server's logout endpoint.

```javascript
window.logout();
```

**Behavior:** Sets `window.location.href` to `{api_url}/logout`

## Custom Elements System

Custom elements are defined in `window.custom` object and automatically initialized when the DOM loads.

### Initialization

The library automatically:
1. Waits for DOM to be ready (`DOMContentLoaded` or immediate if already loaded)
2. Iterates through all keys in `window.custom`
3. Finds all matching HTML elements by tag name
4. Calls the custom element handler and sets `innerHTML`

### Defining Custom Elements

#### Function-based Custom Element

```javascript
window.custom = {
  "my-element": async (data) => {
    return `<div>Content: ${data}</div>`;
  }
};
```

**HTML Usage:**
```html
<my-element></my-element>
```

When `window.state.myKey = 'value'` is set and an element has `data="myKey"`:
```html
<my-element data="myKey"></my-element>
```

The function receives the state value as the first parameter.

#### Object-based Custom Element

```javascript
window.custom = {
  "my-element": {
    prop: (data) => `Processed: ${data}`,
    render: function(data) {
      return `<div>${this.prop(data)}</div>`;
    }
  }
};
```

**HTML Usage:**
```html
<my-element></my-element>
```

When used with reactive state, the `render` method is called with the state value.

### Example: File Widget

```javascript
window.custom = {
  "file-widget": async () => {
    const list = await window.list();
    // Returns HTML string with file list and upload button
    return `<div>...</div>`;
  }
};
```

**HTML Usage:**
```html
<file-widget></file-widget>
```

This custom element:
- Fetches file list using `window.list()`
- Renders file items with download and delete buttons
- Includes an upload button
- Uses inline event handlers that call `window.download()`, `window.purge()`, and `window.put()`

## Error Handling

All API functions throw errors if the request fails. Use try-catch or `.catch()`:

```javascript
try {
  await window.get('nonexistent');
} catch (err) {
  console.error('Error:', err);
}

// Or with promises
window.get('key').catch(err => console.error(err));
```

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <script src="custom.js"></script>
  <script src="client.js"></script>
</head>
<body>
  <!-- Custom element -->
  <file-widget></file-widget>
  
  <!-- Reactive state element -->
  <div data="message">Initial</div>
  
  <script>
    // Set reactive state
    window.state.message = "Hello World";
    
    // Use API functions
    (async () => {
      await window.set('test', 'value');
      const value = await window.get('test');
      console.log(value);
      
      // Upload file
      const fileInput = document.querySelector('input[type="file"]');
      fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        await window.put(file.name, file);
      };
      
      // List files
      const files = await window.list();
      console.log(files);
    })();
  </script>
</body>
</html>
```

## Dependencies

- Requires `custom.js` to be loaded before `client.js` if using custom elements
- Requires a backend server that implements the API endpoints
- Requires browser support for:
  - `fetch` API
  - `Proxy` API
  - `Blob` API
  - `URL.createObjectURL`

## Notes

- All API functions automatically encode keys using `encodeURIComponent`
- The `window.download()` function uses PATCH method internally (browsers don't support custom HTTP methods)
- Custom elements are initialized once on page load; use `location.reload()` to refresh
- The reactive state system only updates elements with matching `data` attributes
- Custom element handlers can be async functions
