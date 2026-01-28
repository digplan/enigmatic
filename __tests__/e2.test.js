const fs = require('fs')
const path = require('path')

// Load client.js and custom.js into jsdom
const clientCode = fs.readFileSync(path.join(__dirname, '../public/client.js'), 'utf8')
const customCode = fs.readFileSync(path.join(__dirname, '../public/custom.js'), 'utf8')

describe('client.js', () => {
  beforeEach(() => {
    // Reset DOM
    global.document.body.innerHTML = ''
    global.document.head.innerHTML = ''
    
    // Set api_url
    global.window.api_url = 'https://localhost:3000'
    
    // Clear window properties that might have descriptors
    try {
      delete global.window.custom
      delete global.window.state
      delete global.window.$
      delete global.window.$$
      delete global.window.$c
      delete global.window.get
      delete global.window.set
      delete global.window.put
      delete global.window.delete
      delete global.window.purge
      delete global.window.list
      delete global.window.login
      delete global.window.logout
      delete global.window.download
      delete global.window.initCustomElements
    } catch (e) {
      // Ignore errors
    }
    
    // Execute client.js code first (sets up Proxy)
    eval(clientCode)
    // Execute custom.js (defines window.custom components)
    eval(customCode)
    
    // Wait for initialization
    return new Promise(resolve => setTimeout(resolve, 100))
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

  describe('window API functions', () => {
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

    test('window.get makes GET request with encoded key', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ value: 'test' })
      })

      const result = await window.get('test key')

      expect(global.fetch).toHaveBeenCalledWith(
        `${window.api_url}/test%20key`,
        expect.objectContaining({ method: 'GET' })
      )
      expect(result).toEqual({ value: 'test' })
    })

    test('window.set makes POST request with string value', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'saved' })
      })

      const result = await window.set('test', 'value')

      expect(global.fetch).toHaveBeenCalledWith(
        `${window.api_url}/test`,
        expect.objectContaining({
          method: 'POST',
          body: 'value'
        })
      )
      expect(result).toEqual({ status: 'saved' })
    })

    test('window.set stringifies object values', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'saved' })
      })

      await window.set('test', { key: 'value' })

      expect(global.fetch).toHaveBeenCalledWith(
        `${window.api_url}/test`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ key: 'value' })
        })
      )
    })

    test('window.delete makes DELETE request', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'deleted' })
      })

      const result = await window.delete('test')

      expect(global.fetch).toHaveBeenCalledWith(
        `${window.api_url}/test`,
        expect.objectContaining({
          method: 'DELETE'
        })
      )
      expect(result).toEqual({ status: 'deleted' })
    })

    test('window.put makes PUT request with string body', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'saved' })
      })

      const result = await window.put('test', 'content')

      expect(global.fetch).toHaveBeenCalledWith(
        `${window.api_url}/test`,
        expect.objectContaining({
          method: 'PUT',
          body: 'content'
        })
      )
      expect(result).toEqual({ status: 'saved' })
    })

    test('window.put stringifies object body', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'saved' })
      })

      await window.put('test', { data: 'value' })

      expect(global.fetch).toHaveBeenCalledWith(
        `${window.api_url}/test`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ data: 'value' })
        })
      )
    })

    test('window.put handles Blob body', async () => {
      const blob = new Blob(['test'], { type: 'text/plain' })
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'saved' })
      })

      await window.put('test', blob)

      expect(global.fetch).toHaveBeenCalledWith(
        `${window.api_url}/test`,
        expect.objectContaining({
          method: 'PUT',
          body: blob
        })
      )
    })

    test('window.purge makes PURGE request', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'deleted' })
      })

      const result = await window.purge('test')

      expect(global.fetch).toHaveBeenCalledWith(
        `${window.api_url}/test`,
        expect.objectContaining({
          method: 'PURGE'
        })
      )
      expect(result).toEqual({ status: 'deleted' })
    })

    test('window.list makes PROPFIND request to base URL', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ name: 'file1' }])
      })

      const result = await window.list()

      expect(global.fetch).toHaveBeenCalledWith(
        `${window.api_url}/`,
        expect.objectContaining({
          method: 'PROPFIND'
        })
      )
      expect(result).toEqual([{ name: 'file1' }])
    })

    test('window.login redirects to /login', () => {
      window.login()
      expect(global.window.location.href).toBe(`${window.api_url}/login`)
    })

    test('window.logout redirects to /logout', () => {
      window.logout()
      expect(global.window.location.href).toBe(`${window.api_url}/logout`)
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


  describe('window.state proxy', () => {
    test('state.set updates DOM elements with data attribute', async () => {
      global.document.body.innerHTML = '<hello-world data="name"></hello-world>'
      
      window.state.name = 'John'
      await new Promise(resolve => setTimeout(resolve, 50))
      
      const el = global.document.querySelector('hello-world')
      expect(el.innerHTML).toBe('Hello John')
    })

    test('state.set updates multiple elements with same data attribute', async () => {
      global.document.body.innerHTML = '<hello-world data="name"></hello-world><hello-world data="name"></hello-world>'
      
      window.state.name = 'Jane'
      await new Promise(resolve => setTimeout(resolve, 50))
      
      const els = global.document.querySelectorAll('hello-world')
      expect(els[0].innerHTML).toBe('Hello Jane')
      expect(els[1].innerHTML).toBe('Hello Jane')
    })

    test('state.set works with object components', async () => {
      global.document.body.innerHTML = '<hello-world-2 data="test"></hello-world-2>'
      
      window.state.test = 'Hello'
      await new Promise(resolve => setTimeout(resolve, 50))
      
      const el = global.document.querySelector('hello-world-2')
      expect(el.innerHTML).toBe('Hello World')
    })

    test('state.set stores value in proxy object', () => {
      window.state.test = 'value'
      expect(window.state.test).toBe('value')
    })

    test('state.set handles multiple properties', async () => {
      global.document.body.innerHTML = '<hello-world data="a"></hello-world><hello-world data="b"></hello-world>'
      
      window.state.a = 'A'
      window.state.b = 'B'
      await new Promise(resolve => setTimeout(resolve, 50))
      
      expect(global.document.querySelector('[data="a"]').innerHTML).toBe('Hello A')
      expect(global.document.querySelector('[data="b"]').innerHTML).toBe('Hello B')
    })

    test('state.set does not update elements without matching data attribute', async () => {
      global.document.body.innerHTML = '<hello-world data="name"></hello-world><div data="other">Original</div>'
      
      window.state.name = 'John'
      await new Promise(resolve => setTimeout(resolve, 50))
      
      expect(global.document.querySelector('[data="name"]').innerHTML).toBe('Hello John')
      expect(global.document.querySelector('[data="other"]').innerHTML).toBe('Original')
    })
  })
})
