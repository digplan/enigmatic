---
name: enigmatic-web-app
description: When asked to make a web app, create only index.html, custom.js, and style.css. Uses the enigmatic library and window.custom web components. If REQUIREMENTS.md exists, use it for app requirements. Use when the user asks for a web app, frontend app, or single-page app.
---

# Enigmatic Web App

## File set (strict)

Every app has **only** these three files:

- **index.html** — Markup, script tags for enigmatic and custom.js, and any custom elements (e.g. `<app-root></app-root>`, `<hw></hw>`).
- **custom.js** — All web component definitions on `window.custom`. No other app logic files.
- **style.css** — All styles. No other stylesheets.

Do not add package.json, playwright, tests, or other files unless the user explicitly asks for them.

## When REQUIREMENTS.md exists

If the project has **REQUIREMENTS.md** (or a similar design/requirements doc):

- Use it as the **source of truth** for the app.
- Implement every section that applies to the requested scope.
- Do not consider the task done until the app matches the requirements and any "Definition of done" or "Acceptance criteria" in that doc.

## index.html

- One script tag for enigmatic:  
  `<script src="https://unpkg.com/enigmatic"></script>`
- Load **custom.js** after enigmatic (e.g. a second script tag).
- In the body, use custom elements whose names match keys in `window.custom` (e.g. `<hw></hw>`, `<app-root></app-root>`). Enigmatic will render each element by calling the corresponding component in `window.custom` and injecting the returned string.

## custom.js — How to define web components

All web components are defined on `window.custom`. Enigmatic turns each custom element (e.g. `<hw>`) into the output of `window.custom["hw"]`.

### 1. Ensure `window.custom` exists

Before defining any component, ensure the object exists so assignments do not throw:

```js
window.custom = window.custom || {};
```

### 2. Define a component as a function that returns a string

Each component is a function assigned to `window.custom.<element-name>`. The function is called by enigmatic; the **return value** (a string) is used as the element's HTML content.

**Example (simple):**

```js
window.custom = window.custom || {};
window.custom.hw = () => {
  return "Hello World";
};
```

With `<hw></hw>` in index.html, the element will show "Hello World".

**Example (dynamic content):**

```js
window.custom = window.custom || {};
window.custom.hw = () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const randomItem = items[Math.floor(Math.random() * items.length)];
  return String(randomItem);  // Enigmatic injects this as HTML
};
```

Here the component returns a number converted to a string. For richer UI, return HTML:

```js
window.custom.hw = () => {
  const items = [1, 2, 3, 4, 5];
  const n = items[Math.floor(Math.random() * items.length)];
  return `<span class="value">${n}</span>`;
};
```

### 3. Component naming

- The property name on `window.custom` must match the custom element name **exactly** (e.g. `window.custom.hw` for `<hw></hw>`, `window.custom["app-root"]` for `<app-root></app-root>`).
- Use lowercase and hyphens for multi-word elements (e.g. `app-root`), and the same key in `window.custom`.

### 4. Summary

| Step | What to do |
|------|------------|
| 1 | `window.custom = window.custom \|\| {};` |
| 2 | `window.custom.<element-name> = function() { return "..."; };` |
| 3 | Use `<element-name></element-name>` in index.html |

Any web components in the app must be defined in **custom.js** in this way. Put all app-specific styles in **style.css**; do not add extra CSS or JS files.

## Checklist

- [ ] Only index.html, custom.js, and style.css exist for the app (unless the user asks for more).
- [ ] index.html: script for enigmatic, then script for custom.js; body contains the custom elements used by the app.
- [ ] custom.js: `window.custom = window.custom \|\| {}`; every component is a function on `window.custom` that returns a string (HTML or text).
- [ ] style.css: all styles for the app.
- [ ] If REQUIREMENTS.md exists: app behavior and content match it; any Definition of done or Acceptance criteria are satisfied.
