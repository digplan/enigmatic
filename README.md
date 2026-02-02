# Enigmatic

![Version](https://img.shields.io/npm/v/enigmatic)

A lightweight client-side JavaScript library for DOM manipulation, reactive state management, and API interactions, with an optional Bun server for backend functionality.

## Architecture

![Client-Server Architecture](clientserver.png)

The diagram above shows the interaction between the client (browser), Bun server, and external services (Auth0 and Cloudflare R2/S3).

## Quick Start

### Using client.js via CDN

Include `client.js` in any HTML file using the unpkg CDN:

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/enigmatic"></script>
  <script src="https://unpkg.com/enigmatic/client/public/custom.js"></script>
  <script>
    window.api_url = 'https://your-server.com';
    window.state.message = 'Hello World';
  </script>
</head>
<body>
  <hello-world data="message"></hello-world>
</body>
</html>
```

**Note:** Use `enigmatic@0.35.0` (or latest) in the URL to pin a version.

### Using the Bun Server

The Bun server provides a complete backend with:
- **Key-value storage** – Per-user KV persisted as append-only JSONL (`server/kv/{user}.jsonl`) with `update`/`delete` actions and timestamps
- **File storage** – Per-user files via Cloudflare R2 (or S3-compatible API)
- **Authentication** – Auth0 OAuth2 login/logout
- **Static files** – Served from `client/public/`

#### Installation

1. Install [Bun](https://bun.sh):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. Install dependencies (if any):
   ```bash
   bun install
   ```

3. TLS certificates: place `cert.pem` and `key.pem` in `server/certs/` for HTTPS (required for Auth0 in production).

#### Environment Variables

Create a `.env` file in the project root (or set env vars):

```bash
# Auth0
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# Cloudflare R2 (optional, for file storage)
CLOUDFLARE_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_SECRET_ACCESS_KEY=your-secret-access-key
CLOUDFLARE_BUCKET_NAME=your-bucket-name
CLOUDFLARE_PUBLIC_URL=https://your-account-id.r2.cloudflarestorage.com
```

#### Running the Server

```bash
npm start
# or
npx enigmatic
# or with hot reload
npm run hot
```

Server runs at **https://localhost:3000** (HTTPS is required for Auth0 cookies).

#### Server Endpoints

| Method   | Path       | Description |
|----------|------------|-------------|
| GET      | `/`        | Serves `client/public/index.html` |
| GET      | `/index.html`, `/*.js`, etc. | Static files from `client/public/` |
| GET      | `/login`   | Redirects to Auth0 login |
| GET      | `/callback`| Auth0 OAuth callback |
| GET      | `/logout`  | Logs out and clears session |
| GET      | `/me`      | Current user or 401 (no auth) |
| GET      | `/{key}`   | KV get (auth required) |
| POST     | `/{key}`   | KV set (auth required) |
| DELETE   | `/{key}`   | KV delete (auth required) |
| PUT      | `/{key}`   | Upload file to R2 (auth required) |
| PURGE    | `/{key}`   | Delete file from R2 (auth required) |
| PROPFIND | `/`        | List R2 files (auth required) |
| PATCH    | `/{key}`   | Download file from R2 (auth required) |

## Optional app convention (skill.md)

The repo includes an optional minimal convention in **`client/public/skill.md`** for building enigmatic web apps. It’s a small, human- and bot-friendly standard you can follow when creating or generating apps:

- **Strict file set** — Only three files: `index.html`, `custom.js`, `style.css`. No package.json, tests, or extra files unless requested.
- **index.html** — One script for enigmatic (CDN), then custom.js. Body uses custom elements whose names match keys in `window.custom` (e.g. `<hw></hw>`, `<app-root></app-root>`).
- **custom.js** — `window.custom = window.custom || {}`; each component is a function on `window.custom` that returns a string (HTML or text). Element names match keys exactly (e.g. `window.custom.hw` for `<hw></hw>`, `window.custom["app-root"]` for `<app-root></app-root>`).
- **style.css** — All app styles in one file.
- **REQUIREMENTS.md** — If present, use it as the source of truth; implement every applicable section and any “Definition of done” or “Acceptance criteria.”

This keeps apps minimal and predictable. See **`client/public/skill.md`** for the full spec, examples, and checklist.

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
window.api_url = "https://localhost:3001"
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

#### `window.me()`
Returns the current user if authenticated, or `null` if not (e.g. 401).

```javascript
const user = await window.me();
// user is { sub, email, ... } or null
```

**Endpoint:** `GET {api_url}/me` (with credentials)

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
  <script src="https://unpkg.com/enigmatic"></script>
  <script src="https://unpkg.com/enigmatic/client/public/custom.js"></script>
  <script>
    window.api_url = window.api_url || window.location.origin;
    window.state.message = 'World';
  </script>
</head>
<body>
  <hello-world data="message"></hello-world>
  <file-widget></file-widget>
  <script>
    window.me().then(u => console.log(u ? 'Logged in as ' + u.email : 'Not logged in'));
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

**Note:** Load `client.js` first, then your custom element definitions (e.g. `custom.js`); the Proxy initializes elements when definitions are assigned.

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

- **Start server:** `npm start` or `npx enigmatic`
- **Hot reload:** `npm run hot`
- **Client:** Load `client.js` from unpkg or from `client/public/client.js` when serving locally. Load `custom.js` (or your definitions) after `client.js`; set `window.api_url` before making API calls.

## License

MIT
