import { APIGatewayEvent } from 'aws-lambda'
import middy from '@middy/core'
import { authenticate } from '../middleware/auth'
import { httpErrorHandler } from '../middleware/httpErrorHandler'
import { pathOr } from 'ramda'
import { saveRecipe, saveRecipes } from '../domain/recipeService'
import createHttpError from 'http-errors'

const handler = async ({ body, pathParameters }: APIGatewayEvent): Promise<APIResponse> => {
  if (!body) {
    throw createHttpError(400)
  }

  const slug = pathOr<string | undefined>(undefined, ['name'], pathParameters)
  const payload = JSON.parse(body)

  if (slug) {
    if (slug !== payload.title) {
      throw createHttpError(400)
    }

    await saveRecipe(payload)
  } else {
    await saveRecipes(pathOr([], ['recipes'], payload))
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: 'ok',
    }),
  }
}

export const endpoint = middy(handler).use(authenticate('admin')).use(httpErrorHandler())
