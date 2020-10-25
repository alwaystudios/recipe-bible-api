import { healthCheck } from './apiClient'

describe('health check', () => {
  it('returns healthy', async () => {
    const result = await healthCheck()
    expect(result).toEqual({
      status: 'healthy',
    })
  })
})
