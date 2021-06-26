import { wrap } from 'lambda-wrapper'
import * as assetUpload from './assetUpload'
import * as contentService from '../domain/contentService'
import { testUser } from '@alwaystudios/recipe-bible-sdk'
import { createAPIGatewayEventMock } from '../../test/factories/proxyEventMock'
import { verifyAuth0Token } from '../clients/auth0'
import * as loggerModule from '../clients/logger'
import { testLogger } from '../../test/factories/testLogger'
import { CORS_HEADERS } from '../constants'
import { parse } from 'lambda-multipart-parser'

jest.mock('lambda-multipart-parser')

jest.mock('../clients/auth0')

const err = jest.fn()
jest.spyOn(loggerModule, 'getLogger').mockReturnValue(testLogger({ err }))

const authMock = verifyAuth0Token as jest.Mock
const wrapped = wrap(assetUpload, { handler: 'endpoint' })
const uploadImage = jest.spyOn(contentService, 'uploadImage')

describe('asset upload API', () => {
  afterEach(jest.clearAllMocks)

  describe('POST /asset-upload', () => {
    it('uploads an image', async () => {
      const body = JSON.stringify({ test: '1234' })
      const files = [{ content: 'content' }] as any
      ;(parse as any).mockResolvedValueOnce({
        filename: 'filename',
        folder: 'folder',
        type: 'type',
        files,
      })
      authMock.mockResolvedValueOnce(testUser())
      uploadImage.mockResolvedValueOnce(undefined)
      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/asset-upload',
        body,
      })

      const result = await wrapped.run(event)

      expect(parse).toHaveBeenCalledTimes(1)
      expect(parse).toHaveBeenCalledWith(expect.objectContaining({ body }))
      expect(authMock).toHaveBeenCalledTimes(1)
      expect(result.statusCode).toBe(200)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(uploadImage).toHaveBeenCalledTimes(1)
      expect(uploadImage).toHaveBeenCalledWith({
        assetType: 'recipe',
        data: Buffer.from('content', 'base64'),
        filename: 'filename',
        folder: 'folder',
        type: 'type',
      })
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'ok',
      })
    })

    test.each([
      ['', 'folder', 'type', [{ content: 'content' }]],
      ['filename', '', 'type', [{ content: 'content' }]],
      ['filename', 'folder', '', [{ content: 'content' }]],
      ['filename', 'folder', 'type', []],
    ])('rejects an incomplete payload', async (filename, folder, type, files) => {
      authMock.mockResolvedValueOnce(testUser())
      ;(parse as any).mockResolvedValueOnce({
        filename,
        folder,
        type,
        files,
      })

      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/asset-upload',
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
