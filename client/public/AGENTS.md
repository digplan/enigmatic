# Custom Web Components Instructions for LLMs

## Overview

When users request web components to be created, you MUST use the `window.custom` system. You can see examples at https://unpkg.com/enigmatic/client/public/custom.js or in the repo at `client/public/custom.js`. This system allows you to define custom HTML elements that automatically render and can be reactive to state changes.

## System Architecture

The custom component system works by:
1. Defining components in `window.custom` object
2. Using custom HTML tags in the DOM (e.g., `<my-component></my-component>`)
3. Components automatically initialize when the DOM loads or when elements are added
4. Components can be reactive to `window.state` changes via `data` attributes

## Component Definition Format

### Format 1: Function-Based Component (Simple)

**Use this format for simple components that just render HTML:**

```javascript
window.custom = {
  "mycomponent": (data) => {
    // data is the value from window.state if element has data="key" attribute
    // If no data attribute, data will be undefined
    return `<div>Your HTML here: ${data || 'default'}</div>`;
  }
};
```

**Example from custom.js:**
```javascript
window.custom = {
  "hello-world": (data) => `Hello ${data}`,
};
```

**HTML Usage:**
```html
<hello-world></hello-world>
<!-- or with reactive state -->
<hello-world data="message"></hello-world>
<script>
  window.state.message = "World"; // Component updates automatically
</script>
```

### Format 2: Object-Based Component (Advanced)

**Use this format when you need methods, properties, or more complex logic:**

```javascript
window.custom = {
  "component-name": {
    // Optional helper methods
    prop: (data) => `Processed: ${data}`,
    
    // Required: render method that returns HTML string
    render: function(data) {
      // Use 'this' to access other methods/properties
      return `<div>${this.prop(data)}</div>`;
    }
  }
};
```

**Example from custom.js:**
```javascript
window.custom = {
  "hello-world-2": {
    prop: (data) => `${data} World`,
    render: function(data) { 
      return this.prop(data); 
    }
  }
};
```

**HTML Usage:**
```html
<hello-world-2 data="greeting"></hello-world-2>
<script>
  window.state.greeting = "Hello"; // Component updates automatically
</script>
```

### Format 3: Async Component

**Use this format when you need to fetch data or perform async operations:**

```javascript
window.custom = {
  "async-component": async () => {
    try {
      const data = await window.get('some-key');
      // Or use other API functions: window.list(), window.set(), etc.
      return `<div>${JSON.stringify(data)}</div>`;
    } catch (err) {
      return `<div>Error: ${err.message}</div>`;
    }
  }
};
```

**Example from custom.js:**
```javascript
window.custom = {
  "file-widget": async () => {
    try {
      const list = await window.list();
      // Render file list with styles and interactive elements
      return `<div>...</div>`;
    } catch (err) {
      return `<div>Error occurred</div>`;
    }
  }
};
```

## Key Rules and Patterns

### 1. Component Names
- Use kebab-case (e.g., `"my-component"`, `"file-widget"`)
- Must match the HTML tag name exactly (case-insensitive)
- Example: `window.custom["my-component"]` → `<my-component></my-component>`

### 2. Return Value
- Components MUST return a string containing HTML
- Can include inline `<style>` tags for component-specific styles
- Can include inline event handlers using `onclick`, `onchange`, etc.

### 3. Reactive State Integration
- Components automatically receive state values when element has `data="key"` attribute
- When `window.state.key = value` is set, all elements with `data="key"` are re-rendered
- Access state value as the first parameter: `(data) => ...` or `render: function(data) { ... }`

### 4. Async Operations
- Use `async` functions when you need to fetch data
- Use `window.get()`, `window.set()`, `window.list()`, `window.put()`, `window.delete()`, `window.purge()`, `window.me()`, `window.download()`, etc. for API calls (all use `window.api_url`)
- Always wrap async operations in try-catch for error handling

### 5. Styling
- Include styles inline using `<style>` tags within the returned HTML
- Use scoped class names (e.g., `.w-c`, `.w-i`) to avoid conflicts
- Keep styles minimal and component-specific

### 6. Event Handlers
- Use inline event handlers: `onclick="..."`, `onchange="..."`
- Can call `window` API functions directly: `onclick="window.download('file.txt')"`
- For async operations, wrap in IIFE: `onclick="(async()=>{await window.purge('file');location.reload()})()"`

## Complete Examples

### Example 1: Simple Counter Component

```javascript
window.custom = {
  "counter": (data) => {
    const count = data || 0;
    return `
      <div style="padding: 20px; text-align: center;">
        <h2>Count: ${count}</h2>
        <button onclick="window.state.count = (window.state.count || 0) + 1">+</button>
        <button onclick="window.state.count = (window.state.count || 0) - 1">-</button>
      </div>
    `;
  }
};
```

**HTML:**
```html
<counter data="count"></counter>
<script>
  window.state.count = 0;
</script>
```

### Example 2: Data Display Component

```javascript
window.custom = {
  "data-display": async () => {
    try {
      const data = await window.get('user-data');
      return `
        <div style="padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
          <h3>User Data</h3>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </div>
      `;
    } catch (err) {
      return `<div style="color: red;">Error loading data: ${err.message}</div>`;
    }
  }
};
```

**HTML:**
```html
<data-display></data-display>
```

### Example 3: Form Component with Object Methods

```javascript
window.custom = {
  "contact-form": {
    validate: (email) => email && email.includes('@'),
    
    render: function(data) {
      const email = data?.email || '';
      const isValid = this.validate(email);
      
      return `
        <style>
          .form-container { padding: 20px; max-width: 400px; }
          .form-input { width: 100%; padding: 8px; margin: 5px 0; }
          .form-submit { background: #007bff; color: white; padding: 10px 20px; border: none; cursor: pointer; }
        </style>
        <div class="form-container">
          <input type="email" class="form-input" 
                 placeholder="Email" 
                 value="${email}"
                 onchange="window.state.formData = {...(window.state.formData || {}), email: this.value}">
          <button class="form-submit" 
                  onclick="alert('Form submitted!')"
                  ${!isValid ? 'disabled' : ''}>
            Submit
          </button>
        </div>
      `;
    }
  }
};
```

**HTML:**
```html
<contact-form data="formData"></contact-form>
<script>
  window.state.formData = { email: '' };
</script>
```

## When to Use Each Format

- **Function format**: Simple components, static content, or when you only need the data parameter
- **Object format**: When you need helper methods, want to organize code better, or need `this` context
- **Async format**: When you need to fetch data from APIs, perform async operations, or load external resources

## Important Notes

1. **Always return HTML strings** - Components must return valid HTML strings
2. **Handle errors** - Wrap async operations in try-catch blocks
3. **Use kebab-case** - Component names must be in kebab-case to match HTML tag names
4. **State reactivity** - Use `data="key"` attribute to make components reactive to `window.state[key]`
5. **Auto-initialization** - Components automatically initialize when:
   - DOM loads
   - Component is added to `window.custom`
   - New matching elements are added to the DOM

## Common Patterns

### Pattern: Loading State
```javascript
window.custom = {
  "loading-component": async () => {
    try {
      const data = await window.get('data');
      return data ? `<div>${data}</div>` : '<div>No data</div>';
    } catch (err) {
      return `<div>Error: ${err.message}</div>`;
    }
  }
};
```

### Pattern: Error Handling
```javascript
window.custom = {
  "safe-component": async () => {
    try {
      const result = await window.list();
      return `<div>Success: ${result.length} items</div>`;
    } catch (err) {
      return `<div style="color: red;">Error: ${err.message}</div>`;
    }
  }
};
```

### Pattern: Conditional Rendering
```javascript
window.custom = {
  "conditional": (data) => {
    if (!data) return '<div>No data</div>';
    if (data.error) return `<div>Error: ${data.error}</div>`;
    return `<div>Data: ${data.value}</div>`;
  }
};
```

## Summary

When creating web components:
1. Define them in `window.custom` object
2. Use kebab-case names matching HTML tag names
3. Return HTML strings (can include styles and event handlers)
4. Use function format for simple components
5. Use object format with `render` method for complex components
6. Use async functions when fetching data
7. Make components reactive by using `data="key"` attributes
8. Always handle errors in async components
