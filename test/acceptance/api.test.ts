import request from 'superagent'
import { LOCAL_BASE_URL } from '../../src/constants'

describe('API', () => {
  describe('recipes', () => {
    it('GET /recipes', async () => {
      const {
        status,
        body: { data },
      } = await request.get(`${LOCAL_BASE_URL}/recipes`)

      expect(status).toBe(200)
      expect(data).not.toBeUndefined()
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
