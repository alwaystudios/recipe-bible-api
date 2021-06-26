import { APIGatewayEvent } from 'aws-lambda'
import middy from '@middy/core'
import { authenticate } from '../middleware/auth'
import { httpErrorHandler } from '../middleware/httpErrorHandler'
import { pathOr } from 'ramda'
import { CORS_HEADERS } from '../constants'
import createHttpError from 'http-errors'
import { deleteRecipe } from '../domain/recipeService'

const handler = async ({ pathParameters }: APIGatewayEvent): Promise<APIResponse> => {
  const slug = pathOr<string | undefined>(undefined, ['name'], pathParameters)

  if (!slug) {
    throw createHttpError(400)
  }

  await deleteRecipe(slug)

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      status: 'ok',
    }),
  }
}

export const endpoint = middy(handler).use(authenticate('admin')).use(httpErrorHandler())
