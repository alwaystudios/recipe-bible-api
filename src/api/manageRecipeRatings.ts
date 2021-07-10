import { APIGatewayEvent } from 'aws-lambda'
import middy from '@middy/core'
import { authenticate } from '../middleware/auth'
import { httpErrorHandler } from '../middleware/httpErrorHandler'
import createHttpError from 'http-errors'
import { CORS_HEADERS } from '../constants'
import { rateRecipe } from '../domain/ratingService'

const handler = async ({ body, pathParameters }: APIGatewayEvent): Promise<APIResponse> => {
  if (!body) {
    throw createHttpError(400)
  }

  const { rating } = JSON.parse(body)
  await rateRecipe(pathParameters!.name!, rating)

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      status: 'ok',
    }),
  }
}

export const endpoint = middy(handler).use(authenticate('admin')).use(httpErrorHandler())
