import middy from '@middy/core'
import { httpErrorHandler } from '../middleware/httpErrorHandler'
import { APIGatewayEvent } from 'aws-lambda'
import { CORS_HEADERS } from '../constants'
import { getRecipeRatings } from '../domain/ratingService'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handler = async ({ pathParameters }: APIGatewayEvent): Promise<APIResponse> => {
  const data = await getRecipeRatings(pathParameters!.name!)

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      status: 'ok',
      data,
    }),
  }
}

export const endpoint = middy(handler).use(httpErrorHandler())
