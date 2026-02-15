/**
 * Enigmatic client library for web applications.
 */

/**
 * Renders a custom element by calling its handler function.
 * Looks up the handler in window.custom by element tag name, then calls it with
 * either the provided value or the value from window.state[data-attribute].
 * 
 * @param {HTMLElement} el - The custom element to render
 * @param {*} [v] - Optional explicit value to pass to the handler
 * @returns {Promise<void>}
 */
const ren = async (el, v) => {
  // Get the custom element handler by tag name (e.g., 'web-app' -> window.custom['web-app'])
  const f = window.custom?.[el.tagName.toLowerCase()];
  if (f) {
    // Check if element has a 'data' attribute for reactive state binding
    const dataAttr = el.getAttribute('data');
    // Use explicit value if provided, otherwise get from state using data attribute
    const val = v !== undefined ? v : (dataAttr ? window.state[dataAttr] : undefined);
    try {
      // Support both object-based (with render method) and function-based handlers
      if (f.render) {
        el.innerHTML = await f.render.call(f, val);
      } else if (typeof f === 'function') {
        el.innerHTML = await f(val);
      }
    } catch (e) {
      console.error(e);
    }
  }
};

/**
 * Global registry for custom element handlers.
 * Each key corresponds to a custom element tag name (e.g., 'web-app', 'hw').
 * Values can be functions or objects with a render method.
 * @type {Object<string, Function|{render: Function}>}
 */
window.custom = {};

/**
 * Reactive state proxy that automatically re-renders custom elements when state changes.
 * When a property is set (e.g., window.state.message = "Hello"), it finds all elements
 * with matching data attributes (e.g., <div data="message">) and re-renders them.
 * @type {Proxy}
 */
const sProx = new Proxy({}, {
  /**
   * Proxy setter trap - called when window.state[key] = value
   * @param {Object} o - The target object
   * @param {string} p - The property name being set
   * @param {*} v - The value being set
   * @returns {boolean} - Must return true for the assignment to succeed
   */
  set(o, p, v) {
    o[p] = v;
    // Find all elements with data attribute matching this property and re-render them
    window.$$(`[data="${p}"]`).forEach(el => ren(el, v));
    return true;
  }
});

/**
 * Makes an HTTP request to the Enigmatic backend API.
 * 
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {string} [key] - Optional key/path to append to API URL (URL-encoded)
 * @param {*} [body] - Request body (Blob, string, or JSON-serializable object)
 * @returns {Promise<Response>} - Fetch response object
 */
const req = (method, key, body) =>
  fetch(`${window.api_url}/${key ? encodeURIComponent(key) : ''}`, {
    method,
    // Send Blob/string as-is, otherwise JSON stringify
    body: body instanceof Blob || typeof body === 'string' ? body : JSON.stringify(body),
    credentials: 'include', // Include cookies for authentication
  });

/**
 * Converts a fetch Response to JSON, with error handling for non-JSON responses.
 * 
 * @param {Response} r - Fetch response object
 * @returns {Promise<*>} - Parsed JSON data
 * @throws {Error} - If response is not JSON content-type
 */
const toJson = (r) => {
  const ct = (r.headers.get('content-type') || '').toLowerCase();
  if (!ct.includes('application/json')) {
    // Server returned HTML or other non-JSON content (likely an error page)
    return r.text().then((t) => { 
      throw new Error('Server returned non-JSON (HTML?): ' + (t.slice(0, 60) || r.status)); 
    });
  }
  return r.json();
};

/**
 * Makes a JSON POST request to a URL with credentials.
 * 
 * @param {string} url - Full URL to request
 * @param {*} data - Data to send (will be JSON stringified)
 * @returns {Promise<*>} - Parsed JSON response
 */
const fetchJson = async (url, data) => {
  const r = await fetch(url, { 
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return await toJson(r);
};

/**
 * Assigns utility functions and API methods to the global window object.
 * These are the public API for using Enigmatic in web applications.
 */
Object.assign(window, {
  /**
   * DOM selector - alias for document.querySelector
   * @param {string} s - CSS selector
   * @returns {Element|null} - First matching element or null
   */
  $: (s) => document.querySelector(s),
  
  /**
   * DOM selector - alias for document.querySelectorAll
   * @param {string} s - CSS selector
   * @returns {NodeList} - All matching elements
   */
  $$: (s) => document.querySelectorAll(s),
  
  /**
   * Closest element - alias for element.closest (requires $0 context in console)
   * @param {string} s - CSS selector
   * @returns {Element|null} - Closest matching ancestor or null
   */
  $c: (s) => $0.closest(s),
  
  /**
   * Reactive state object - changes automatically trigger re-renders of bound elements
   * @type {Proxy}
   * @example
   * window.state.message = "Hello"; // Re-renders all <div data="message"> elements
   */
  state: sProx,
  
  /**
   * Makes a JSON POST request with credentials
   * @type {Function}
   */
  fetchJson,
  
  /**
   * Gets a value from the backend key-value store
   * @param {string} k - Key to retrieve
   * @returns {Promise<*>} - The stored value or null
   */
  get: (k) => req('GET', k).then(toJson),
  
  /**
   * Sets a value in the backend key-value store
   * @param {string} k - Key to store
   * @param {*} v - Value to store (string, number, object, etc.)
   * @returns {Promise<{key: string, value: *}>} - Confirmation with key and value
   */
  set: (k, v) => req('POST', k, v).then(toJson),
  
  /**
   * Uploads a file or data to backend file storage (R2/S3)
   * @param {string} k - Filename/key
   * @param {Blob|string|*} v - File content (Blob, string, or JSON-serializable)
   * @returns {Promise<{status: string}>} - Confirmation message
   */
  put: (k, v) => req('PUT', k, v).then(toJson),
  
  /**
   * Deletes a key from the backend key-value store
   * @param {string} k - Key to delete
   * @returns {Promise<{status: string}>} - Confirmation message
   */
  delete: (k) => req('DELETE', k).then(toJson),
  
  /**
   * Deletes a file from backend file storage (R2/S3)
   * @param {string} k - Filename/key to delete
   * @returns {Promise<{status: string}>} - Confirmation message
   */
  purge: (k) => req('PURGE', k).then(toJson),
  
  /**
   * Lists all files in the current user's backend file storage
   * @returns {Promise<Array<{name: string, lastModified: string, size: number}>>} - Array of file metadata
   */
  list: () => req('PROPFIND').then(toJson),
  
  /**
   * Gets the current authenticated user information
   * @returns {Promise<Object|null>} - User object with sub, email, etc., or null if not authenticated
   */
  me: () => fetch(`${window.api_url}/me`, { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)),
  
  /**
   * Redirects to the login endpoint (Auth0 OAuth flow)
   */
  login: () => window.location.href = `${window.api_url}/login`,
  
  /**
   * Redirects to the logout endpoint (clears session)
   */
  logout: () => window.location.href = `${window.api_url}/logout`,
  
  /**
   * Downloads a file from backend storage and triggers browser download
   * @param {string} k - Filename/key to download
   * @returns {Promise<void>}
   * @throws {Error} - If download fails
   */
  download: async (k) => {
    const r = await req('PATCH', k);
    if (!r.ok) throw new Error('Download failed');
    // Create temporary download link and trigger click
    const a = document.createElement('a');
    a.href = URL.createObjectURL(await r.blob());
    a.download = k;
    a.click();
    URL.revokeObjectURL(a.href); // Clean up
  },
  
  /**
   * Initializes all custom elements in the DOM by calling their handlers.
   * Finds all elements matching registered custom element tag names and renders them.
   */
  initCustomElements: () => {
    if (!document.body) return;
    // Iterate through all registered custom element types
    Object.keys(window.custom || {}).forEach((t) => {
      const elements = window.$$(t);
      if (elements.length > 0) {
        // Render each matching element
        elements.forEach(el => ren(el));
      }
    });
  }
});

/**
 * Bootstraps the Enigmatic library:
 * 1. Initializes custom elements on page load
 * 2. Sets up MutationObserver to auto-initialize new custom elements added dynamically
 */
const boot = () => {
  // Initialize custom elements immediately and after a short delay
  // (delay catches elements added during script execution)
  if (window.initCustomElements) {
    window.initCustomElements();
    setTimeout(() => window.initCustomElements(), 10);
  }
  
  // Watch for new elements added to the DOM and auto-initialize custom elements
  if (document.body) {
    new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          // Only process element nodes (not text nodes, etc.)
          if (node.nodeType === 1) {
            const tag = node.tagName?.toLowerCase();
            // If the added node itself is a custom element, render it
            if (tag && window.custom?.[tag]) ren(node);
            // Also check all child elements for custom elements
            node.querySelectorAll && Array.from(node.querySelectorAll('*')).forEach((child) => {
              const childTag = child.tagName?.toLowerCase();
              if (childTag && window.custom?.[childTag]) ren(child);
            });
          }
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  // DOM already loaded, run immediately
  setTimeout(boot, 0);
}
