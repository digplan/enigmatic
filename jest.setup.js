// Mock window.components if not defined
if (typeof window !== 'undefined' && !window.components) {
  window.components = {}
}

// Add fetch polyfill for jsdom
if (typeof global.fetch === 'undefined') {
  global.fetch = require('whatwg-fetch').fetch
}

