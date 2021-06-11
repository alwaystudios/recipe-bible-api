import { APIGatewayEvent } from 'aws-lambda'
import middy from '@middy/core'
import { httpErrorHandler } from '../middleware/httpErrorHandler'
import { pathOr } from 'ramda'
import { getRecipe, getRecipes } from '../domain/recipeService'
import createHttpError from 'http-errors'
import { toApiRecipeResponseData } from './recipeTransformer'
import { CORS_HEADERS } from '../constants'

const handler = async ({
  queryStringParameters,
  multiValueQueryStringParameters,
  pathParameters,
}: APIGatewayEvent): Promise<APIResponse> => {
  const slug = pathOr<string | undefined>(undefined, ['name'], pathParameters)
  const _published = pathOr('true', ['published'], queryStringParameters)
  const _focused = pathOr('all', ['focused'], queryStringParameters)
  const fields = pathOr<string[] | undefined>(undefined, ['field'], multiValueQueryStringParameters)

  const data = slug
    ? await getRecipe(slug)
    : await getRecipes({
        published: _published === 'true',
        focused: _focused === 'all' ? 'all' : _focused === 'true',
      })

  if (!data) {
    throw createHttpError(404)
  }

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      status: 'ok',
      data: toApiRecipeResponseData(data, fields),
    }),
  }
}

export const endpoint = middy(handler).use(httpErrorHandler())
