import { APIGatewayEvent } from 'aws-lambda'
import middy from '@middy/core'
import { authenticate } from '../middleware/auth'
import { httpErrorHandler } from '../middleware/httpErrorHandler'
import { pathOr } from 'ramda'
import { createRecipe, saveRecipe, saveRecipes } from '../domain/recipeService'
import createHttpError from 'http-errors'
import { getLogger } from '../clients/logger'

const handler = async ({
  body,
  pathParameters,
  httpMethod,
}: APIGatewayEvent): Promise<APIResponse> => {
  const logger = getLogger()

  if (!body) {
    logger.error('manage recipe error, missing body')
    throw createHttpError(400)
  }

  const slug = pathOr<string | undefined>(undefined, ['name'], pathParameters)
  const payload = JSON.parse(body)

  if (httpMethod === 'POST' && slug) {
    throw createHttpError(404)
  }

  if (httpMethod === 'POST') {
    await createRecipe(payload.title).catch((err) => {
      logger.error(`manage recipe error, ${err.message}`)
      throw createHttpError(400)
    })
  } else if (slug) {
    if (slug !== payload.title) {
      throw createHttpError(400)
    }
    await saveRecipe(payload)
  } else {
    await saveRecipes(pathOr([], ['recipes'], payload))
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      status: 'ok',
    }),
  }
}

export const endpoint = middy(handler).use(authenticate('admin')).use(httpErrorHandler())
