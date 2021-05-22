import { APIGatewayEvent } from 'aws-lambda'
import middy from '@middy/core'
import { authenticate, AuthenticatedContext } from '../middleware/auth'
import { httpErrorHandler } from '../middleware/httpErrorHandler'

const handler = async (
  { httpMethod }: APIGatewayEvent,
  { user }: AuthenticatedContext
): Promise<APIResponse> => {
  // todo
  console.log(httpMethod, user)

  return {
    statusCode: 204,
    body: '',
  }
}

export const endpoint = middy(handler).use(authenticate('admin')).use(httpErrorHandler())
