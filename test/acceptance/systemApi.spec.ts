import { getStatus } from './apiClient'

describe('system status', () => {
  it('returns a list of system status keys', async () => {
    const response = await getStatus()
    expect(response.status).toEqual(200)
  })
})
