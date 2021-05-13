import { APIGatewayEvent } from 'aws-lambda'
import middy from '@middy/core'
import { httpErrorHandler } from '../middleware/httpErrorHandler'
import { pathOr } from 'ramda'
import { getRecipes } from '../domain/recipeService'

const handler = async ({
  queryStringParameters,
}: APIGatewayEvent): Promise<{
  statusCode: number
  body: string
}> => {
  // const slug = pathOr<string | undefined>(undefined, ['name'], pathParameters)
  const _published = pathOr('true', ['published'], queryStringParameters)
  const _focused = pathOr('all', ['focused'], queryStringParameters)

  // todo: handle /recipe/{name}

  const data = await getRecipes({
    published: _published === 'true',
    focused: _focused === 'all' ? 'all' : _focused === 'true',
  })

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: 'ok',
      data,
    }),
  }
}

export const endpoint = middy(handler).use(httpErrorHandler())
