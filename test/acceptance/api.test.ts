import request from 'superagent'
import { LOCAL_BASE_URL } from '../../src/constants'

describe('API', () => {
  describe('asset upload', () => {
    it('POST /asset-upload is authenticated', async () => {
      await expect(request.post(`${LOCAL_BASE_URL}/asset-upload`)).rejects.toEqual(
        new Error('Unauthorized')
      )
    })
  })

  describe('ingredients', () => {
    it('GET /ingredients', async () => {
      const {
        status,
        body: { data },
      } = await request.get(`${LOCAL_BASE_URL}/ingredients`)

      expect(status).toBe(200)
      expect(data).not.toBeUndefined()
      expect(Array.isArray(data)).toBe(true)
    })

    it('PUT /ingredients is authenticated', async () => {
      await expect(request.put(`${LOCAL_BASE_URL}/ingredients`)).rejects.toEqual(
        new Error('Unauthorized')
      )
    })
  })

  describe('adverts', () => {
    it('GET /adverts', async () => {
      const {
        status,
        body: { data },
      } = await request.get(`${LOCAL_BASE_URL}/adverts`)

      expect(status).toBe(200)
      expect(data).not.toBeUndefined()
      expect(Array.isArray(data)).toBe(true)
    })
  })

  describe('recipes', () => {
    it('GET /recipes', async () => {
      const {
        status,
        body: { data },
      } = await request.get(`${LOCAL_BASE_URL}/recipes`)

      expect(status).toBe(200)
      expect(data).not.toBeUndefined()
      expect(Array.isArray(data)).toBe(true)
    })

    it('GET /recipes/{name}', async () => {
      await expect(request.get(`${LOCAL_BASE_URL}/recipes/not-found`)).rejects.toEqual(
        new Error('Not Found')
      )
    })

    test.each([
      ['post', 'recipes'],
      ['put', 'recipes'],
      ['delete', 'recipes/test'],
      ['post', 'recipe-ratings/test'],
      ['post', 'adverts'],
      ['delete', 'adverts'],
    ])('%s /%s is authenticated', async (method: string, url: string) => {
      const req =
        method === 'post'
          ? request.post
          : method === 'put'
          ? request.put
          : method === 'delete'
          ? request.delete
          : method === 'get'
          ? request.get
          : undefined
      if (!req) {
        throw new Error(`http method: ${method} not supported`)
      }
      await expect(req(`${LOCAL_BASE_URL}/${url}`)).rejects.toEqual(new Error('Unauthorized'))
    })
  })
})
