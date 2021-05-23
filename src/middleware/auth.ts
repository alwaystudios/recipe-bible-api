import middy from '@middy/core'
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { pathOr } from 'ramda'
import { verifyAuth0Token } from '../clients/auth0'
import { User } from '@alwaystudios/recipe-bible-sdk'

export interface AuthenticatedContext extends Context {
  user?: User
}

export class AuthenticationError extends Error {
  error: string
  statusCode: number
  body: string

  constructor(message: string) {
    super(message)
    this.error = 'AuthenticationError'
    this.statusCode = 401
    this.body = message
    Error.captureStackTrace(this, AuthenticationError)
  }
}

export class AuthorizationError extends Error {
  error: string
  statusCode: number
  body: string

  constructor(message: string) {
    super(message)
    this.error = 'AuthorizationError'
    this.statusCode = 403
    this.body = message
    Error.captureStackTrace(this, AuthorizationError)
  }
}

export const authenticate = (
  requiredRole?: string
): middy.MiddlewareObject<APIGatewayProxyEvent, APIGatewayProxyResult, AuthenticatedContext> => {
  return {
    before: async (
      handler: middy.HandlerLambda<
        APIGatewayProxyEvent,
        APIGatewayProxyResult,
        AuthenticatedContext
      >
    ) => {
      const { event, context } = handler

      const token = pathOr('', ['headers', 'Authorization'], event)
      const user = await verifyAuth0Token(token).catch((err) => {
        throw new AuthenticationError(err.message)
      })

      if (requiredRole) {
        const roles = pathOr<string[]>([], ['https://recipebible.net/roles'], user)

        if (!roles.includes(requiredRole)) {
          throw new AuthorizationError('Permission denied for user')
        }
      }

      Object.assign(context, { user })
    },
  }
}
