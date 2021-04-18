import request from 'superagent'
import { BASE_URL } from '../../src/constants'

describe('API', () => {
	describe('recipes', () => {
		it('GET /recipes', async () => {
			const {
				status,
				body: { data },
			} = await request.get(`${BASE_URL}/recipe`)

			expect(status).toBe(200)
			expect(data).not.toBeUndefined()
		})
	})
})
