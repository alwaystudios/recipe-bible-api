import { APIGatewayEvent } from 'aws-lambda'
import middy from '@middy/core'
import { authenticate } from '../middleware/auth'
import { httpErrorHandler } from '../middleware/httpErrorHandler'
import createHttpError from 'http-errors'
import { CORS_HEADERS } from '../constants'
import { deleteAdvert, saveAdvert } from '../domain/advertService'

const handler = async ({ body, httpMethod }: APIGatewayEvent): Promise<APIResponse> => {
  if (!body) {
    throw createHttpError(400)
  }

  const payload = JSON.parse(body)

  switch (httpMethod) {
    case 'POST':
      await saveAdvert(payload)
      break
    case 'DELETE':
      await deleteAdvert(payload)
      break
    default:
      throw createHttpError(400)
  }

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      status: 'ok',
    }),
  }
}

export const endpoint = middy(handler).use(authenticate('admin')).use(httpErrorHandler())
