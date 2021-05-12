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
  })
})
