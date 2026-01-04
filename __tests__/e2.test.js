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
      const mockData = { id: 1, name: 'Test' }
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve(mockData)
        })
      )

      const result = await window.fetchJson('GET', 'http://test.com/api')

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test.com/api',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })
      )
      expect(result.data).toEqual(mockData)
      expect(result.status).toBe(200)
      expect(result.statusText).toBe('OK')
      expect(result.headers).toBeDefined()
    })

    test('fetches JSON with POST method and body', async () => {
      const mockData = { success: true }
      const requestBody = { name: 'Test' }
      
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 201,
          statusText: 'Created',
          headers: new Headers(),
          json: () => Promise.resolve(mockData)
        })
      )

      const result = await window.fetchJson('POST', 'http://test.com/api', {
        body: JSON.stringify(requestBody)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test.com/api',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(requestBody)
        })
      )
      expect(result.data).toEqual(mockData)
      expect(result.status).toBe(201)
      expect(result.statusText).toBe('Created')
    })

    test('fetches JSON with PUT method', async () => {
      const mockData = { updated: true }
      
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          json: () => Promise.resolve(mockData)
        })
      )

      const result = await window.fetchJson('PUT', 'http://test.com/api/1', {
        body: JSON.stringify({ name: 'Updated' })
      })

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test.com/api/1',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })
      )
      expect(result.data).toEqual(mockData)
    })

    test('fetches JSON with DELETE method', async () => {
      const mockData = { deleted: true }
      
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          json: () => Promise.resolve(mockData)
        })
      )

      const result = await window.fetchJson('DELETE', 'http://test.com/api/1')

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test.com/api/1',
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })
      )
      expect(result.data).toEqual(mockData)
    })

    test('overwrites custom headers with Content-Type', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          json: () => Promise.resolve({})
        })
      )

      await window.fetchJson('GET', 'http://test.com/api', {
        headers: { 'Authorization': 'Bearer token123' }
      })

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test.com/api',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json'
          }
        })
      )
      // Custom headers are overwritten by Content-Type
      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer token123'
          })
        })
      )
    })

    test('always includes credentials', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          json: () => Promise.resolve({})
        })
      )

      await window.fetchJson('GET', 'http://test.com/api')

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test.com/api',
        expect.objectContaining({
          credentials: 'include'
        })
      )
    })

    test('handles error responses', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          headers: new Headers(),
          json: () => Promise.resolve({ error: 'Not found' })
        })
      )

      const result = await window.fetchJson('GET', 'http://test.com/api')

      expect(result.status).toBe(404)
      expect(result.statusText).toBe('Not Found')
      expect(result.data).toEqual({ error: 'Not found' })
    })

    test('handles network errors', async () => {
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network error'))
      )

      await expect(window.fetchJson('GET', 'http://test.com/api')).rejects.toThrow('Network error')
    })
  })
})

