import { NextFunction } from 'express'
import jwt from 'express-jwt'
import jwksRsa from 'jwks-rsa'
import { ApiRequest, ApiResponse } from './types'

export const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://dev-27x9tbv3.eu.auth0.com/.well-known/jwks.json',
  }),
  audience: 'https://dev-27x9tbv3.eu.auth0.com/api/v2/',
  issuer: 'https://dev-27x9tbv3.eu.auth0.com/',
  algorithms: ['RS256'],
})

export const userMiddleware = (req: ApiRequest, res: ApiResponse, next: NextFunction): void => {
  if (req.user) {
    const sub = req.user.sub
    const roles = req.user['https://recipebible.net/roles']
    res.locals.user = { sub, roles }
  }
  next()
}
