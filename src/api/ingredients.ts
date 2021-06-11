import middy from '@middy/core'
import { httpErrorHandler } from '../middleware/httpErrorHandler'
import { getIngredients } from '../domain/ingredientService'
import { APIGatewayEvent } from 'aws-lambda'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handler = async (_: APIGatewayEvent): Promise<APIResponse> => {
  const data = await getIngredients()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      status: 'ok',
      data,
    }),
  }
}

export const endpoint = middy(handler).use(httpErrorHandler())
