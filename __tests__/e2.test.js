const fs = require('fs')
const path = require('path')

// Load client.js into jsdom
const clientCode = fs.readFileSync(path.join(__dirname, '../public/client.js'), 'utf8')

describe('client.js', () => {
  beforeEach(() => {
    // Reset DOM
    global.document.body.innerHTML = ''
    global.document.head.innerHTML = ''
    
    // Clear window.custom
    global.window.custom = {}
    
    // Execute client.js code
    eval(clientCode)
  })

  describe('$ and $$ selectors', () => {
    test('$ selects single element', () => {
      global.document.body.innerHTML = '<div id="test">Hello</div>'
      expect(window.$('#test').textContent).toBe('Hello')
    })

    test('$$ selects multiple elements', () => {
      global.document.body.innerHTML = '<div class="item">1</div><div class="item">2</div>'
      const items = window.$$('.item')
      expect(items.length).toBe(2)
      expect(items[0].textContent).toBe('1')
      expect(items[1].textContent).toBe('2')
    })

    test('$ returns null for non-existent element', () => {
      global.document.body.innerHTML = '<div>Test</div>'
      expect(window.$('#nonexistent')).toBeNull()
    })

    test('$$ returns empty NodeList for non-existent elements', () => {
      global.document.body.innerHTML = '<div>Test</div>'
      expect(window.$$('.nonexistent').length).toBe(0)
    })
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

    test('includes Content-Type header in request', async () => {
      const result = await window.fetchJson('POST', 'https://httpbin.org/post', {
        body: JSON.stringify({ test: 'data' })
      })

      expect(result.status).toBe(200)
      expect(result.data.headers['Content-Type']).toBeDefined()
    })

    test('includes credentials in request', async () => {
      const result = await window.fetchJson('GET', 'https://httpbin.org/get')

      expect(result.status).toBe(200)
      expect(result.data).toBeDefined()
    })

    test('handles error responses', async () => {
      const result = await window.fetchJson('GET', 'https://httpbin.org/status/404')
      expect(result.status).toBe(404)
      expect(result.statusText).toBe('NOT FOUND')
    })

    test('handles network errors', async () => {
      await expect(
        window.fetchJson('GET', 'https://invalid-domain-that-does-not-exist-12345.com/api')
      ).rejects.toThrow()
    })
  })

  describe('window.custom components', () => {
    test('hello-world component is a function', () => {
      expect(typeof window.custom['hello-world']).toBe('function')
    })

    test('hello-world component renders correctly', () => {
      const result = window.custom['hello-world']('Test')
      expect(result).toBe('Hello Test')
    })

    test('hello-world-2 component has prop and render methods', () => {
      expect(window.custom['hello-world-2']).toBeDefined()
      expect(typeof window.custom['hello-world-2'].prop).toBe('function')
      expect(typeof window.custom['hello-world-2'].render).toBe('function')
    })

    test('hello-world-2 component prop works', () => {
      const result = window.custom['hello-world-2'].prop('Test')
      expect(result).toBe('Test World')
    })

    test('hello-world-2 component render works', () => {
      const result = window.custom['hello-world-2'].render('Test')
      expect(result).toBe('Test World')
    })
  })

  describe('window.custom.api', () => {
    let originalFetch
    let originalLocation

    beforeEach(() => {
      originalFetch = global.fetch
      global.fetch = jest.fn()
      originalLocation = global.window.location
      delete global.window.location
      global.window.location = { href: '' }
    })

    afterEach(() => {
      global.fetch = originalFetch
      global.window.location = originalLocation
    })

    test('api.get makes GET request to /{key}', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('value1'),
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'text/plain' })
      })

      const result = await window.custom.api.get('test')

      expect(global.fetch).toHaveBeenCalledWith(
        '/test',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include'
        })
      )
      expect(result).toBe('value1')
    })

    test('api.get URL encodes key parameter', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('value1'),
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'text/plain' })
      })

      await window.custom.api.get('test key')

      expect(global.fetch).toHaveBeenCalledWith(
        '/test%20key',
        expect.any(Object)
      )
    })

    test('api.set makes POST request to /{key} with body as value', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('Saved KV'),
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'text/plain' })
      })

      const result = await window.custom.api.set('test', 'newValue')

      expect(global.fetch).toHaveBeenCalledWith(
        '/test',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: 'newValue'
        })
      )
      expect(result).toBe('Saved KV')
    })

    test('api.set handles object values by stringifying', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('Saved KV'),
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'text/plain' })
      })

      await window.custom.api.set('test', { key: 'value' })

      expect(global.fetch).toHaveBeenCalledWith(
        '/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ key: 'value' })
        })
      )
    })

    test('api.delete makes DELETE request to /{key}', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('Deleted KV'),
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'text/plain' })
      })

      const result = await window.custom.api.delete('test')

      expect(global.fetch).toHaveBeenCalledWith(
        '/test',
        expect.objectContaining({
          method: 'DELETE',
          credentials: 'include'
        })
      )
      expect(result).toBe('Deleted KV')
    })

    test('api.put makes PUT request to /{key}', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('Saved R2'),
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'text/plain' })
      })

      const result = await window.custom.api.put('test', 'file content')

      expect(global.fetch).toHaveBeenCalledWith(
        '/test',
        expect.objectContaining({
          method: 'PUT',
          credentials: 'include',
          body: 'file content'
        })
      )
      expect(result).toBe('Saved R2')
    })

    test('api.purge makes PURGE request to /{key}', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('Deleted R2'),
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'text/plain' })
      })

      const result = await window.custom.api.purge('test')

      expect(global.fetch).toHaveBeenCalledWith(
        '/test',
        expect.objectContaining({
          method: 'PURGE',
          credentials: 'include'
        })
      )
      expect(result).toBe('Deleted R2')
    })

    test('api.login redirects to /login', () => {
      window.custom.api.login()
      expect(global.window.location.href).toBe('/login')
    })

    test('api.logout redirects to /logout', () => {
      window.custom.api.logout()
      expect(global.window.location.href).toBe('/logout')
    })
  })

  describe('window.state proxy', () => {
    test('state.set updates DOM elements with data attribute', () => {
      global.document.body.innerHTML = '<hello-world data="name"></hello-world>'
      
      window.state.name = 'John'
      
      const el = global.document.querySelector('hello-world')
      expect(el.innerHTML).toBe('Hello John')
    })

    test('state.set updates multiple elements with same data attribute', () => {
      global.document.body.innerHTML = '<hello-world data="name"></hello-world><hello-world data="name"></hello-world>'
      
      window.state.name = 'Jane'
      
      const els = global.document.querySelectorAll('hello-world')
      expect(els[0].innerHTML).toBe('Hello Jane')
      expect(els[1].innerHTML).toBe('Hello Jane')
    })

    test('state.set works with object components', () => {
      global.document.body.innerHTML = '<hello-world-2 data="test"></hello-world-2>'
      
      window.state.test = 'Hello'
      
      const el = global.document.querySelector('hello-world-2')
      expect(el.innerHTML).toBe('Hello World')
    })

    test('state.set stores value in proxy object', () => {
      window.state.test = 'value'
      expect(window.state.test).toBe('value')
    })

    test('state.set handles multiple properties', () => {
      global.document.body.innerHTML = '<hello-world data="a"></hello-world><hello-world data="b"></hello-world>'
      
      window.state.a = 'A'
      window.state.b = 'B'
      
      expect(global.document.querySelector('[data="a"]').innerHTML).toBe('Hello A')
      expect(global.document.querySelector('[data="b"]').innerHTML).toBe('Hello B')
    })

    test('state.set does not update elements without matching data attribute', () => {
      global.document.body.innerHTML = '<hello-world data="name"></hello-world><div data="other">Original</div>'
      
      window.state.name = 'John'
      
      expect(global.document.querySelector('[data="name"]').innerHTML).toBe('Hello John')
      expect(global.document.querySelector('[data="other"]').innerHTML).toBe('Original')
    })
  })
})
