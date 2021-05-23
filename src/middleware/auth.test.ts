import middy from '@middy/core'
import { Callback, Context } from 'aws-lambda'
import { datatype } from 'faker'
import { testUser } from '@alwaystudios/recipe-bible-sdk'
import * as auth0 from '../clients/auth0'
import { authenticate, AuthenticationError, AuthorizationError } from './auth'

const verifyAuth0Token = jest.spyOn(auth0, 'verifyAuth0Token')
const Authorization = datatype.uuid()

const emptyHandler = (headers: any = { Authorization }): middy.HandlerLambda => ({
  event: {
    headers,
  },
  context: {} as Context,
  response: {},
  error: {} as Error,
  callback: null as unknown as Callback,
})
const user = testUser()

describe('auth middleware', () => {
  afterEach(jest.clearAllMocks)

  it('authenticates when no role is required', async () => {
    verifyAuth0Token.mockResolvedValueOnce(user)
    const { before } = authenticate()

    await expect(before!(emptyHandler(), jest.fn())).resolves.toBeUndefined()
    expect(verifyAuth0Token).toHaveBeenCalledTimes(1)
    expect(verifyAuth0Token).toHaveBeenCalledWith(Authorization)
  })

  it('authenticates user has the required role', async () => {
    verifyAuth0Token.mockResolvedValueOnce(user)
    const { before } = authenticate('admin')

    await expect(before!(emptyHandler(), jest.fn())).resolves.toBeUndefined()
    expect(verifyAuth0Token).toHaveBeenCalledTimes(1)
    expect(verifyAuth0Token).toHaveBeenCalledWith(Authorization)
  })

  it('throws AuthenticationError when token is invalid', async () => {
    verifyAuth0Token.mockRejectedValueOnce(new Error('invalid token'))
    const { before } = authenticate()

    await expect(before!(emptyHandler(), jest.fn())).rejects.toEqual(
      new AuthenticationError('invalid token')
    )
  })

  it('throws AuthorizationError when user does not have required role', async () => {
    verifyAuth0Token.mockResolvedValueOnce(user)
    const { before } = authenticate('required-role')

    await expect(before!(emptyHandler(), jest.fn())).rejects.toEqual(
      new AuthorizationError('Permission denied for user')
    )
    expect(verifyAuth0Token).toHaveBeenCalledTimes(1)
    expect(verifyAuth0Token).toHaveBeenCalledWith(Authorization)
  })
})
