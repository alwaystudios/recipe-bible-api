import middy from '@middy/core'
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { verify } from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'
import { pathOr } from 'ramda'
import { JWKSURI, KID } from '../constants'

export interface AuthenticatedContext extends Context {
  user?: any // todo: proper type
}

class AuthenticationError extends Error {
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

class AuthorizationError extends Error {
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
      const token = pathOr('', ['headers', 'Authorization'], event).replace('Bearer ', '')
      const signingKey = await jwksClient({ jwksUri: JWKSURI }).getSigningKey(KID)
      const publicKey = signingKey.getPublicKey()

      const user = await new Promise((resolve, reject) =>
        verify(
          token,
          publicKey,
          {
            algorithms: ['RS256'],
          },
          (err, decoded) => {
            if (err) {
              reject(err)
            }
            resolve(decoded)
          }
        )
      ).catch((err) => {
        throw new AuthenticationError(err.message)
      })

      if (requiredRole) {
        const roles = pathOr<string[]>([], ['https://recipebible.net/roles'], user)

        if (!roles.includes(requiredRole)) {
          throw new AuthorizationError('Permission denied for user')
        }
      }

      context.user = user
    },
  }
}
