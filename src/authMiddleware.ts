import jwt from 'express-jwt'
import jwksRsa from 'jwks-rsa'

export const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://dev-27x9tbv3.eu.auth0.com/.well-known/jwks.json`,
  }),

  audience: 'https://recipebible.net/api',
  issuer: `https://dev-27x9tbv3.eu.auth0.com/`,
  algorithms: ['RS256'],
})
