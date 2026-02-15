# Enigmatic

## 1. Project Overview

**Project Name:** Enigmatic  
**Type:** Open-source JavaScript library with Bun server  
**License:** MIT

## 2. Purpose & Vision

### Why This Project Exists

Modern web development has become increasingly complex, with heavy build processes, massive frameworks, and steep learning curves. Enigmatic exists to provide a **lightweight, zero-build alternative** for building interactive web applications.

### Core Philosophy

- **Simplicity over complexity**: No build steps, no bundlers, no transpilation
- **Progressive enhancement**: Start with a single HTML file and a script tag
- **Batteries included**: Client library + optional server = complete stack
- **Developer experience**: Minimal API surface, intuitive patterns, rapid prototyping

## 3. Problem Statement

### The Challenge

Developers building small-to-medium web applications face a dilemma:

1. **Pure static sites** lack interactivity, state management, and backend integration
2. **Modern frameworks** (React, Vue, Angular) require complex tooling, build processes, and significant learning investment
3. **Backend solutions** often require separate deployment, complex configuration, and vendor lock-in

### Target Audience

- Rapid prototypers who need to go from idea to working app quickly
- Developers building internal tools and dashboards
- Educators teaching web development fundamentals
- Indie hackers and solo developers
- Anyone who wants to add interactivity without framework overhead

## 4. Solution

Enigmatic provides a **complete, lightweight stack**:

### Client Library (`client.js`)
- **Reactive state management** via Proxy objects
- **Custom HTML elements** for component-like behavior
- **DOM utilities** ($, $$ selectors)
- **API integration** for KV storage, file operations, and auth
- **Zero dependencies** – works in any modern browser

### Bun Server (Optional)
- **Key-value storage** – per-user persisted JSONL storage
- **File storage** – Cloudflare R2/S3-compatible object storage
- **Authentication** – Auth0 OAuth2 integration
- **LLM proxy** – OpenRouter integration for AI features
- **Static file serving** – for local development

## 5. Key Features

| Feature | Description | Use Case |
|---------|-------------|----------|
| Reactive State | Proxy-based state that auto-updates DOM | Live data dashboards |
| Custom Elements | Define components with `window.custom` | Reusable UI components |
| KV Storage | Simple key-value persistence | User preferences, app state |
| File Storage | Upload/download with R2/S3 | Document management |
| Authentication | OAuth2 login/logout | User-specific data |
| LLM Proxy | Chat completions via OpenRouter | AI-powered features |

## 6. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│  ┌──────────────────┐        ┌──────────────────────────┐  │
│  │   client.js      │◄──────►│    Custom Elements       │  │
│  │  (DOM + State)   │        │  (window.custom)         │  │
│  └──────────────────┘        └──────────────────────────┘  │
│           │                                                │
│           ▼                                                │
│  ┌──────────────────┐        ┌──────────────────────────┐  │
│  │   window.state   │◄──────►│   Reactive DOM Updates   │  │
│  └──────────────────┘        └──────────────────────────┘  │
└───────────┬─────────────────────────────────────────────────┘
            │ HTTP/HTTPS
            ▼
┌─────────────────────────────────────────────────────────────┐
│                      BUN SERVER (Optional)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  KV Store    │  │   Auth0      │  │  Cloudflare R2   │  │
│  │  (JSONL)     │  │  (OAuth2)    │  │   (File Store)   │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 7. Success Metrics

- **Developer adoption**: Downloads, GitHub stars, community contributions
- **Ease of use**: Time to first working app (< 5 minutes)
- **Performance**: Minimal bundle size, fast load times
- **Flexibility**: Works for simple sites to complex dashboards

## 8. Project Scope

### In Scope
- Client library with state management and DOM utilities
- Bun server with KV, file storage, and auth
- Plugin architecture for extensibility
- Documentation and examples

### Out of Scope
- Database ORM or complex data modeling
- Server-side rendering (SSR)
- Mobile app development
- Enterprise-grade scalability features

## 9. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Bun runtime adoption | Medium | Bun is gaining traction; Node.js port possible |
| Security concerns | High | Auth0 integration, HTTPS enforcement, input validation |
| Limited ecosystem | Low | Plugin architecture allows community extensions |

## 10. Future Roadmap

- **v1.0**: Stable API, comprehensive test suite
- **v1.1**: Additional storage backends (PostgreSQL, MongoDB)
- **v1.2**: WebSocket support for real-time features
- **v2.0**: TypeScript definitions, CLI scaffolding tools

## 11. Conclusion

Enigmatic bridges the gap between static HTML and full-stack frameworks. By prioritizing simplicity and progressive enhancement, it empowers developers to build interactive web applications without the overhead of modern build pipelines.

**Get started in 30 seconds:**

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/enigmatic"></script>
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

---

*This charter serves as the foundational document for the Enigmatic project. All major decisions should align with the principles outlined herein.*

# Technical 


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
- **LLM proxy** – Proxies chat requests to [OpenRouter](https://openrouter.ai); no auth required. Set `OPENROUTER_API_KEY` to use.

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

# OpenRouter (optional, for LLM proxy)
OPENROUTER_API_KEY=sk-or-v1-...
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
| POST     | `/llm/chat` | LLM proxy: forwards body to OpenRouter chat completions (no auth). Body: `{ model, messages }`. |
| GET      | `/{key}`   | KV get (auth required) |
| POST     | `/{key}`   | KV set (auth required) |
| DELETE   | `/{key}`   | KV delete (auth required) |
| PUT      | `/{key}`   | Upload file to R2 (auth required) |
| PURGE    | `/{key}`   | Delete file from R2 (auth required) |
| PROPFIND | `/`        | List R2 files (auth required) |
| PATCH    | `/{key}`   | Download file from R2 (auth required) |

#### LLM proxy

The server can proxy chat requests to [OpenRouter](https://openrouter.ai). Set `OPENROUTER_API_KEY` in the environment. **No auth** is required for `/llm/chat`; the endpoint forwards the request body to OpenRouter and returns the response.

**Request:** `POST {api_url}/llm/chat` with JSON body (OpenRouter chat completions format):

```json
{ "model": "openai/gpt-3.5-turbo", "messages": [{ "role": "user", "content": "Hello" }] }
```

**Example (curl):**

```bash
curl -X POST "https://localhost:3000/llm/chat" -k \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-3.5-turbo","messages":[{"role":"user","content":"Say hi."}]}'
```

**Example (client):** From a page, `fetch(api_url + '/llm/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model, messages }) })`. See `client/public/api.html` for a chat UI that uses this endpoint.

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
