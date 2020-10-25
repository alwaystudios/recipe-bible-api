import { recipe } from './apiClient'

describe('recipes', () => {
  it('returns a list of recipes', async () => {
    const result = await recipe()
    expect(result.status).toEqual(200)
  })
})
