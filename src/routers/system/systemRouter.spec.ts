import request from 'supertest'
import { testApp } from '../../../test/testApp'
import config from '../../infra/config'
import * as systemRepository from './systemRepository'
import { testLog } from '../../../test/testLog'
import { testSystemStatus } from '../../../test/testSystemStatus'

const systemStatus = testSystemStatus()
const getSystemStatus = jest
  .spyOn(systemRepository, 'getSystemStatus')
  .mockResolvedValue(systemStatus)

describe('system router', () => {
  beforeEach(jest.clearAllMocks)

  describe('GET /api/v2/system', () => {
    it('responds with a of system status keys', async () => {
      const app = testApp(config)

      const { status, body } = await request(app).get('/api/v2/system')

      expect(status).toEqual(200)
      expect(body).toEqual(systemStatus)
      expect(getSystemStatus).toHaveBeenCalledTimes(1)
    })

    it('handles failures', async () => {
      const err = jest.fn()
      const error = Error('boom')
      getSystemStatus.mockRejectedValueOnce(error)
      const app = testApp(config, testLog({ err }))
      const { status } = await request(app).get('/api/v2/system')

      expect(status).toBe(500)
      expect(err).toHaveBeenCalledTimes(1)
      expect(err).toHaveBeenCalledWith('Service error, url: GET /api/v2/system', error)
    })
  })
})
