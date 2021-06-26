import { wrap } from 'lambda-wrapper'
import * as assetUpload from './assetUpload'
import * as contentService from '../domain/contentService'
import { testUser } from '@alwaystudios/recipe-bible-sdk'
import { createAPIGatewayEventMock } from '../../test/factories/proxyEventMock'
import { verifyAuth0Token } from '../clients/auth0'
import * as loggerModule from '../clients/logger'
import { testLogger } from '../../test/factories/testLogger'
import { CORS_HEADERS } from '../constants'

jest.mock('../clients/auth0')

const err = jest.fn()
jest.spyOn(loggerModule, 'getLogger').mockReturnValue(testLogger({ err }))

const authMock = verifyAuth0Token as jest.Mock
const wrapped = wrap(assetUpload, { handler: 'endpoint' })
const uploadImage = jest.spyOn(contentService, 'uploadImage')

const file = 'data:image/jpeg;base64,1234'
const folder = 'some-folder'
const type = 'file-type'
const filename = 'filename'

describe('asset upload API', () => {
  afterEach(jest.clearAllMocks)

  describe('POST /asset-upload', () => {
    it('uploads an image', async () => {
      const body = JSON.stringify({ file, folder, type, filename })

      authMock.mockResolvedValueOnce(testUser())
      uploadImage.mockResolvedValueOnce(undefined)
      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/asset-upload',
        body,
      })

      const result = await wrapped.run(event)

      expect(authMock).toHaveBeenCalledTimes(1)
      expect(result.statusCode).toBe(200)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(uploadImage).toHaveBeenCalledTimes(1)
      expect(uploadImage).toHaveBeenCalledWith({
        assetType: 'recipe',
        data: Buffer.from('1234', 'base64'),
        filename,
        folder,
        type,
      })
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'ok',
      })
    })

    test.each([
      ['', 'folder', 'type', file],
      ['filename', '', 'type', file],
      ['filename', 'folder', '', file],
      ['filename', 'folder', type, undefined],
    ])('rejects an incomplete payload', async (filename, folder, type, file) => {
      authMock.mockResolvedValueOnce(testUser())
      const body = JSON.stringify({ file, folder, type, filename })

      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/asset-upload',
        body,
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(400)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(uploadImage).not.toHaveBeenCalled()
      expect(err).toHaveBeenCalledTimes(1)
      expect(err).toHaveBeenCalledWith('upload asset, invalid payload')
    })

    it('requires the admin role', async () => {
      authMock.mockResolvedValueOnce(testUser({ 'https://recipebible.net/roles': ['non-admin'] }))
      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/asset-upload',
        body: JSON.stringify({ test: '123' }),
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(403)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(uploadImage).not.toHaveBeenCalled()
      expect(uploadImage).not.toHaveBeenCalled()
    })
  })
})
