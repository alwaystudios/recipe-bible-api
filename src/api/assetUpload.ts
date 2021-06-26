import middy from '@middy/core'
import { httpErrorHandler } from '../middleware/httpErrorHandler'
import { APIGatewayEvent } from 'aws-lambda'
import { CORS_HEADERS } from '../constants'
import { pathOr } from 'ramda'
import { AssetType, uploadImage } from '../domain/contentService'
import { authenticate } from '../middleware/auth'
import createHttpError from 'http-errors'
import { getLogger } from '../clients/logger'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handler = async ({ body, queryStringParameters }: APIGatewayEvent): Promise<APIResponse> => {
  const logger = getLogger()

  const assetType = pathOr<AssetType>('recipe', ['assetType'], queryStringParameters)
  const { filename, folder, type, file } = JSON.parse(body || '{}')

  if (!file || !filename || !folder || !type) {
    logger.error('upload asset, invalid payload')
    throw createHttpError(400)
  }

  const data = Buffer.from(file.split('data:image/jpeg;base64,').pop(), 'base64')
  await uploadImage({ assetType, filename, folder, data, type })

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      status: 'ok',
    }),
  }
}

export const endpoint = middy(handler).use(authenticate('admin')).use(httpErrorHandler())
