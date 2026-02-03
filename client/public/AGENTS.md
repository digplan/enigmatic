---
name: enigmatic-web-app
description: When asked to make a web app, create only index.html, custom.js, and style.css. Uses the enigmatic library and window.custom web components. If REQUIREMENTS.md exists, use it for app requirements. Use when the user asks for a web app, frontend app, or single-page app.
---

# Enigmatic Web App

## What is Enigmatic?

**Enigmatic** is a full-stack web platform:
- **Client library** — DOM manipulation, reactive state, API interactions (CDN: `https://unpkg.com/enigmatic`)
- **Backend server** — KV storage, file storage (R2/S3), Auth0 auth, LLM proxy, static file serving

## File Structure

Every app has **only** these three files:
- **index.html** — Markup, script tags, custom elements
- **custom.js** — All `window.custom` component definitions
- **style.css** — All styles

## index.html

```html
<script src="https://unpkg.com/enigmatic"></script>
<script src="custom.js"></script>
<script>
  window.api_url = 'https://your-server.com';
</script>
<body>
  <simple></simple>
  <hw data="name"></hw>
</body>
```

## custom.js — Component Convention

Components can be functions or objects with a `render` method. Use `data` attributes to bind to `window.state`:

```js
window.custom = {
  simple: () => `Hi Worlds!`,
  hw: {
    dos: (s) => s,
    render: function(s) {
      return this.dos(s);
    }
  }
};
state.name = "Hello Worlds!"
```

- `<simple></simple>` → calls `window.custom.simple()`
- `<hw data="name"></hw>` → calls `window.custom.hw.render(window.state.name)`
- Setting `window.state.name = "New"` automatically re-renders all `<hw data="name">` elements

## API Calls

All API functions return Promises. Use `await` or `.then()`:

**Key-Value Storage:**
- `await window.get(key)` — Get value
- `await window.set(key, value)` — Set value
- `await window.delete(key)` — Delete key

**File Storage:**
- `await window.put(filename, blobOrString)` — Upload file
- `await window.list()` — List all files `[{name, lastModified, size}, ...]`
- `await window.download(filename)` — Download file
- `await window.purge(filename)` — Delete file

**Authentication:**
- `await window.me()` — Get current user or `null`
- `window.login()` — Redirect to login
- `window.logout()` — Redirect to logout

**General:**
- `await window.fetchJson(url, data)` — POST JSON with credentials

**Example:**
```js
window.custom = {
  data: async () => {
    const user = await window.me();
    const items = await window.list();
    return `<div>User: ${user?.email || 'Not logged in'}</div>`;
  }
};
```

## REQUIREMENTS.md

If **REQUIREMENTS.md** exists, use it as the source of truth. Implement all sections and meet acceptance criteria.

## Checklist

- [ ] Only index.html, custom.js, style.css exist
- [ ] index.html: enigmatic script, custom.js script, `window.api_url` set, custom elements in body
- [ ] custom.js: `window.custom` object with component functions/objects
- [ ] style.css: all app styles
- [ ] REQUIREMENTS.md (if exists): all requirements met
