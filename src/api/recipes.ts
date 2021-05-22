import { APIGatewayEvent } from 'aws-lambda'
import middy from '@middy/core'
import { httpErrorHandler } from '../middleware/httpErrorHandler'
import { pathOr } from 'ramda'
import { getRecipe, getRecipes } from '../domain/recipeService'
import createHttpError from 'http-errors'

const handler = async ({
  queryStringParameters,
  pathParameters,
}: APIGatewayEvent): Promise<APIResponse> => {
  const slug = pathOr<string | undefined>(undefined, ['name'], pathParameters)
  const _published = pathOr('true', ['published'], queryStringParameters)
  const _focused = pathOr('all', ['focused'], queryStringParameters)

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
    body: JSON.stringify({
      status: 'ok',
      data,
    }),
  }
}

export const endpoint = middy(handler).use(httpErrorHandler())
