import request from 'superagent'
import { LOCAL_BASE_URL } from '../../src/constants'

describe('API', () => {
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

    it('POST /recipes is authenticated', async () => {
      await expect(request.post(`${LOCAL_BASE_URL}/recipes`)).rejects.toEqual(
        new Error('Unauthorized')
      )
    })

    it('PUT /recipes is authenticated', async () => {
      await expect(request.put(`${LOCAL_BASE_URL}/recipes/test`)).rejects.toEqual(
        new Error('Unauthorized')
      )
    })
  })
})
