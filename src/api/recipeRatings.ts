import middy from '@middy/core'
import { httpErrorHandler } from '../middleware/httpErrorHandler'
import { APIGatewayEvent } from 'aws-lambda'
import { CORS_HEADERS } from '../constants'
import { getAllRecipeRatings, getRecipeRatings } from '../domain/ratingService'
import { pathOr } from 'ramda'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handler = async ({ pathParameters }: APIGatewayEvent): Promise<APIResponse> => {
  const slug = pathOr<string | undefined>(undefined, ['name'], pathParameters)
  const data = slug ? await getRecipeRatings(slug) : await getAllRecipeRatings()

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
