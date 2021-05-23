import { APIGatewayEvent } from 'aws-lambda'
import middy from '@middy/core'
import { authenticate } from '../middleware/auth'
import { httpErrorHandler } from '../middleware/httpErrorHandler'
import { pathOr } from 'ramda'
import createHttpError from 'http-errors'
import { saveIngredient, saveIngredients } from '../domain/ingredientService'

const handler = async ({ body, queryStringParameters }: APIGatewayEvent): Promise<APIResponse> => {
  if (!body) {
    throw createHttpError(400)
  }

  const importIngredients = pathOr<string>('false', ['import'], queryStringParameters)
  const payload = JSON.parse(body)

  if (importIngredients === 'true') {
    const ingredients = pathOr([], ['ingredients'], payload)

    await saveIngredients(ingredients)
  } else {
    const ingredient = pathOr(undefined, ['ingredient'], payload)

    if (!ingredient) {
      throw createHttpError(400)
    }

    await saveIngredient(ingredient)
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: 'ok',
    }),
  }
}

export const endpoint = middy(handler).use(authenticate('admin')).use(httpErrorHandler())
