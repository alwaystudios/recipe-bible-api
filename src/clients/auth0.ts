import { verify } from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'
import { JWKSURI, KID } from '../constants'

export const verifyAuth0Token = async (token: string): Promise<User> => {
  const _token = token.replace('Bearer ', '')
  const signingKey = await jwksClient({ jwksUri: JWKSURI }).getSigningKey(KID)
  const publicKey = signingKey.getPublicKey()

  return new Promise((resolve, reject) =>
    verify(
      _token,
      publicKey,
      {
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err) {
          reject(err)
        }
        resolve(decoded as User)
      }
    )
  )
}
