import request from 'supertest'
import { testApp } from '../../test/testApp'
import { testLog } from '../../test/testLog'
import config from '../infra/config'

const log = testLog()

describe('GET /api/v2/healthcheck', () => {
  it('responds as healthy', async () => {
    const app = testApp(config, log)

    const { status, body } = await request(app).get('/api/v2/healthcheck')

    expect(status).toEqual(200)
    expect(body).toEqual({
      status: 'healthy',
    })
  })
})
