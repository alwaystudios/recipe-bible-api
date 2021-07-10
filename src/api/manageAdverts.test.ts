import { wrap } from 'lambda-wrapper'
import * as manageadverts from './manageAdverts'
import * as advertService from '../domain/advertService'
import { testAdvert, testUser } from '@alwaystudios/recipe-bible-sdk'
import { createAPIGatewayEventMock } from '../../test/factories/proxyEventMock'
import { verifyAuth0Token } from '../clients/auth0'
import { CORS_HEADERS } from '../constants'

jest.mock('../clients/auth0')

const authMock = verifyAuth0Token as jest.Mock
const wrapped = wrap(manageadverts, { handler: 'endpoint' })
const saveAdvert = jest.spyOn(advertService, 'saveAdvert')
const deleteAdvert = jest.spyOn(advertService, 'deleteAdvert')

describe('manage adverts API', () => {
  afterEach(jest.clearAllMocks)

  describe('POST /adverts', () => {
    it('saves an advert', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const advert = testAdvert()
      saveAdvert.mockResolvedValueOnce(undefined)
      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/adverts',
        body: JSON.stringify(advert),
      })

      const result = await wrapped.run(event)

      expect(authMock).toHaveBeenCalledTimes(1)
      expect(result.statusCode).toBe(200)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(deleteAdvert).not.toHaveBeenCalled()
      expect(saveAdvert).toHaveBeenCalledTimes(1)
      expect(saveAdvert).toHaveBeenCalledWith(advert)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'ok',
      })
    })

    it('rejects missing advert data', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/adverts',
        body: '',
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(400)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(saveAdvert).not.toHaveBeenCalled()
    })

    it('rejects an empty payload', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/adverts',
        body: '',
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(400)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(saveAdvert).not.toHaveBeenCalled()
    })

    it('requires the admin role', async () => {
      authMock.mockResolvedValueOnce(testUser({ 'https://recipebible.net/roles': ['non-admin'] }))
      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/adverts',
        body: JSON.stringify({ test: '123' }),
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(403)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(saveAdvert).not.toHaveBeenCalled()
    })
  })

  describe('DELETE /adverts', () => {
    it('deletes an advert', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const advert = testAdvert()
      deleteAdvert.mockResolvedValueOnce(undefined)
      const event = createAPIGatewayEventMock({
        httpMethod: 'DELETE',
        path: '/adverts',
        body: JSON.stringify(advert),
      })

      const result = await wrapped.run(event)

      expect(authMock).toHaveBeenCalledTimes(1)
      expect(result.statusCode).toBe(200)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(saveAdvert).not.toHaveBeenCalled()
      expect(deleteAdvert).toHaveBeenCalledTimes(1)
      expect(deleteAdvert).toHaveBeenCalledWith(advert)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'ok',
      })
    })

    it('rejects missing advert data', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const event = createAPIGatewayEventMock({
        httpMethod: 'DELETE',
        path: '/adverts',
        body: '',
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(400)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(deleteAdvert).not.toHaveBeenCalled()
    })

    it('rejects an empty payload', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const event = createAPIGatewayEventMock({
        httpMethod: 'DELETE',
        path: '/adverts',
        body: '',
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(400)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(deleteAdvert).not.toHaveBeenCalled()
    })

    it('requires the admin role', async () => {
      authMock.mockResolvedValueOnce(testUser({ 'https://recipebible.net/roles': ['non-admin'] }))
      const event = createAPIGatewayEventMock({
        httpMethod: 'DELETE',
        path: '/adverts',
        body: JSON.stringify({ test: '123' }),
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(403)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(deleteAdvert).not.toHaveBeenCalled()
    })
  })
})
