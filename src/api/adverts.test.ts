import { wrap } from 'lambda-wrapper'
import * as adverts from './adverts'
import * as advertservice from '../domain/advertService'
import { createAPIGatewayEventMock } from '../../test/factories/proxyEventMock'
import { CORS_HEADERS } from '../constants'
import * as loggerModule from '../clients/logger'
import { testLogger } from '../../test/factories/testLogger'
import { testAdvert, testUser } from '@alwaystudios/recipe-bible-sdk'
import { verifyAuth0Token } from '../clients/auth0'

jest.mock('../clients/auth0')
const authMock = verifyAuth0Token as jest.Mock

const err = jest.fn()
jest.spyOn(loggerModule, 'getLogger').mockReturnValue(testLogger({ err }))

const wrapped = wrap(adverts, { handler: 'endpoint' })
const getadverts = jest.spyOn(advertservice, 'getAdverts')

describe('adverts API', () => {
  describe('GET /adverts', () => {
    it('returns all adverts', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const data = [testAdvert(), testAdvert()]
      getadverts.mockResolvedValueOnce(data)
      const event = createAPIGatewayEventMock({
        httpMethod: 'GET',
        path: '/adverts',
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(200)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(getadverts).toHaveBeenCalledTimes(1)
      expect(getadverts).toHaveBeenCalledWith()
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'ok',
        data,
      })
    })

    it('handles errors', async () => {
      authMock.mockResolvedValueOnce(testUser())
      getadverts.mockRejectedValueOnce(new Error('boom'))
      const event = createAPIGatewayEventMock({
        httpMethod: 'GET',
        path: '/adverts',
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(500)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(err).toHaveBeenCalledTimes(1)
      expect(err).toHaveBeenCalledWith('Server error: Error: boom')
    })

    it('requires the admin role', async () => {
      authMock.mockResolvedValueOnce(testUser({ 'https://recipebible.net/roles': ['non-admin'] }))
      const event = createAPIGatewayEventMock({
        httpMethod: 'GET',
        path: '/adverts',
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(403)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(getadverts).not.toHaveBeenCalled()
    })
  })
})
