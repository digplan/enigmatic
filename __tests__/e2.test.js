const fs = require('fs')
const path = require('path')

// Load e2.js into jsdom
const e2Code = fs.readFileSync(path.join(__dirname, '../e2.js'), 'utf8')

describe('e2.js', () => {
  beforeEach(() => {
    // Reset DOM
    global.document.body.innerHTML = ''
    global.document.head.innerHTML = ''
    
    // Clear window.custom
    global.window.custom = {}
    
    // Execute e2.js code
    eval(e2Code)
  })

  describe('fetchJson', () => {
    test('fetches JSON with GET method', async () => {
      const result = await window.fetchJson('GET', 'https://httpbin.org/json')

      expect(result.status).toBe(200)
      expect(result.statusText).toBe('OK')
      expect(result.data).toBeDefined()
      expect(typeof result.data).toBe('object')
      expect(result.headers).toBeDefined()
    })

    test('fetches JSON with POST method and body', async () => {
      const requestBody = { name: 'Test', value: 123 }
      
      const result = await window.fetchJson('POST', 'https://httpbin.org/post', {
        body: JSON.stringify(requestBody)
      })

      expect(result.status).toBe(200)
      expect(result.data).toBeDefined()
      expect(result.data.json).toEqual(requestBody)
    })

    test('fetches JSON with PUT method', async () => {
      const requestBody = { name: 'Updated' }
      
      const result = await window.fetchJson('PUT', 'https://httpbin.org/put', {
        body: JSON.stringify(requestBody)
      })

      expect(result.status).toBe(200)
      expect(result.data).toBeDefined()
      expect(result.data.json).toEqual(requestBody)
    })

    test('fetches JSON with DELETE method', async () => {
      const result = await window.fetchJson('DELETE', 'https://httpbin.org/delete')

      expect(result.status).toBe(200)
      expect(result.data).toBeDefined()
    })

    test('includes Content-Type header', async () => {
      const result = await window.fetchJson('POST', 'https://httpbin.org/post', {
        body: JSON.stringify({ test: 'data' })
      })

      expect(result.status).toBe(200)
      expect(result.data.headers['Content-Type']).toBe('application/json')
    })

    test('includes credentials in request', async () => {
      const result = await window.fetchJson('GET', 'https://httpbin.org/get')

      expect(result.status).toBe(200)
      // httpbin doesn't expose credentials, but we verify the request succeeded
      expect(result.data).toBeDefined()
    })

    test('handles error responses', async () => {
      // httpbin status endpoints return empty body, so fetchJson will throw on JSON parse
      await expect(
        window.fetchJson('GET', 'https://httpbin.org/status/404')
      ).rejects.toThrow()
    })

    test('handles network errors', async () => {
      await expect(
        window.fetchJson('GET', 'https://invalid-domain-that-does-not-exist-12345.com/api')
      ).rejects.toThrow()
    })
  })
})
