# Enigmatic

![Tests](https://img.shields.io/badge/tests-26%20passing-brightgreen) ![Size](https://img.shields.io/badge/size-3.4%20KB-blue) ![Version](https://img.shields.io/npm/v/enigmatic)

A lightweight client-side JavaScript library for DOM manipulation, reactive state management, and API interactions, with an optional Bun server for backend functionality.

## Quick Start

### Using client.js via CDN

Include `client.js` in any HTML file using the unpkg CDN:

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/enigmatic@0.34.0/public/client.js"></script>
  <script>
    // Configure your API URL
    window.api_url = 'https://your-server.com';
    
    // Define custom elements
    window.custom = {
      "hello-world": (data) => `Hello ${data || 'World'}`
    };
  </script>
</head>
<body>
  <hello-world data="message"></hello-world>
  <script>
    window.state.message = "Hello World";
  </script>
</body>
</html>
```

**Note:** Replace `0.34.0` with the latest version number from [npm](https://www.npmjs.com/package/enigmatic).

### Using the Bun Server

The Bun server provides a complete backend implementation with:
- Key-value storage (using BeeMap)
- File storage (using Cloudflare R2/S3)
- Authentication (using Auth0)
- Static file serving

#### Installation

1. Install Bun (if not already installed):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Generate HTTPS certificates (for local development):
   ```bash
   cd server
   ./generate-certs.sh
   cd ..
   ```

#### Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# Cloudflare R2 Configuration (optional, for file storage)
CLOUDFLARE_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_SECRET_ACCESS_KEY=your-secret-access-key
CLOUDFLARE_BUCKET_NAME=your-bucket-name
CLOUDFLARE_PUBLIC_URL=https://your-account-id.r2.cloudflarestorage.com
```

#### Running the Server

Start the server with hot reload:
```bash
npm start
# or
bun --hot ./bun-server.js
```

The server will start on `https://localhost:3000` (HTTPS is required for Auth0 cookies).

#### Server Features

- **Static File Serving**: Automatically serves any files from the `public/` folder
- **Key-Value Storage**: Per-user KV storage using BeeMap (persisted to JSONL files)
- **File Storage**: Per-user file storage using Cloudflare R2 (or compatible S3)
- **Authentication**: OAuth2 flow with Auth0
- **CORS**: Enabled for all origins (configurable)

#### Server Endpoints

- `GET /` or `GET /index.html` - Serves `public/index.html`
- `GET /{path}` - Serves static files from `public/` folder
- `GET /login` - Initiates Auth0 login flow
- `GET /callback` - Auth0 callback handler
- `GET /logout` - Logs out user
- `GET /{key}` - Retrieves KV value (requires auth)
- `POST /{key}` - Stores KV value (requires auth)
- `DELETE /{key}` - Deletes KV value (requires auth)
- `PUT /{key}` - Uploads file to R2 (requires auth)
- `PURGE /{key}` - Deletes file from R2 (requires auth)
- `PROPFIND /` - Lists files in R2 (requires auth)
- `PATCH /{key}` - Downloads file from R2 (requires auth)

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
- Only elements with matching custom element handlers are updated
- Supports both function and object-based custom elements

**Example:**
```html
<my-element data="message">Initial</my-element>
<script>
  window.custom['my-element'] = (data) => `<div>${data}</div>`;
  window.state.message = "Updated!"; // Automatically updates the element
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

Custom elements are defined in `window.custom` object and automatically initialized when the DOM loads or when elements are added dynamically.

### Initialization

The library automatically:
1. Waits for DOM to be ready (`DOMContentLoaded` or immediate if already loaded)
2. Iterates through all keys in `window.custom`
3. Finds all matching HTML elements by tag name
4. Calls the custom element handler and sets `innerHTML`
5. Watches for new elements added to the DOM via MutationObserver and initializes them automatically

### Proxy Behavior

`window.custom` is a Proxy that automatically initializes matching elements when you add a new custom element definition:

```javascript
// Adding a new custom element automatically initializes all matching elements in the DOM
window.custom['my-element'] = (data) => `<div>${data}</div>`;
// All <my-element> tags are immediately initialized
```

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

When used with reactive state, the function receives the state value:
```html
<my-element data="myKey"></my-element>
<script>
  window.state.myKey = 'value'; // Function is called with 'value'
</script>
```

The function receives the state value as the first parameter. If no state value is set, it receives `undefined`.

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
  <script src="https://unpkg.com/enigmatic@0.34.0/public/client.js"></script>
  <script>
    // Configure API URL
    window.api_url = 'https://localhost:3000';
    
    // Define custom elements
    window.custom = {
      "hello-world": (data) => `Hello ${data || 'World'}`
    };
  </script>
</head>
<body>
  <!-- Custom element with reactive state -->
  <hello-world data="message"></hello-world>
  
  <script>
    // Set reactive state (triggers updates to elements with data="message")
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

- Requires a backend server that implements the API endpoints (or use the included Bun server)
- Requires browser support for:
  - `fetch` API
  - `Proxy` API
  - `Blob` API
  - `URL.createObjectURL`
  - `MutationObserver` API

**Note:** Custom element definitions can be loaded before or after `client.js` - the Proxy system will handle initialization either way.

## Notes

- All API functions automatically encode keys using `encodeURIComponent`
- The `window.download()` function uses PATCH method internally (browsers don't support custom HTTP methods)
- Custom elements are automatically initialized:
  - On page load (when DOM is ready)
  - When new custom element definitions are added to `window.custom`
  - When new matching elements are added to the DOM (via MutationObserver)
- The reactive state system only updates elements with matching `data` attributes
- Custom element handlers can be async functions
- When a custom element has a `data` attribute, it automatically reads from `window.state[dataValue]` if no explicit value is provided

## Development

### Running Tests

```bash
npm test
```

### Building

The library is ready to use as-is. For production, you can use the minified version:

```html
<script src="https://unpkg.com/enigmatic@0.34.0/public/client.min.js"></script>
```

## License

MIT
