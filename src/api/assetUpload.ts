import middy from '@middy/core'
import { httpErrorHandler } from '../middleware/httpErrorHandler'
import { APIGatewayEvent } from 'aws-lambda'
import { CORS_HEADERS } from '../constants'
import { pathOr } from 'ramda'
import { AssetType, uploadImage } from '../domain/contentService'
import { authenticate } from '../middleware/auth'
import { parse } from 'lambda-multipart-parser'
import createHttpError from 'http-errors'
import { getLogger } from '../clients/logger'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handler = async (event: APIGatewayEvent): Promise<APIResponse> => {
  const logger = getLogger()

  const assetType = pathOr<AssetType>('recipe', ['assetType'], event.queryStringParameters)
  const result = await parse(event)
  const data = pathOr(undefined, ['files', 0, 'content'], result)
  const { filename, folder, type } = result

  if (!data || !filename || !folder || !type) {
    logger.error('upload asset, invalid payload')
    throw createHttpError(400)
  }

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
