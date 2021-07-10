import { wrap } from 'lambda-wrapper'
import * as manageRecipeRatings from './manageRecipeRatings'
import * as ratingService from '../domain/ratingService'
import { testUser } from '@alwaystudios/recipe-bible-sdk'
import { createAPIGatewayEventMock } from '../../test/factories/proxyEventMock'
import { verifyAuth0Token } from '../clients/auth0'
import { CORS_HEADERS } from '../constants'

jest.mock('../clients/auth0')

const title = 'my-recipe'
const rating = 5
const authMock = verifyAuth0Token as jest.Mock
const wrapped = wrap(manageRecipeRatings, { handler: 'endpoint' })
const rateRecipe = jest.spyOn(ratingService, 'rateRecipe')

describe('manage recipe ratings API', () => {
  afterEach(jest.clearAllMocks)

  describe('POST /recipe-ratings/{name}', () => {
    it('saves a recipe rating', async () => {
      authMock.mockResolvedValueOnce(testUser())
      rateRecipe.mockResolvedValueOnce(undefined)
      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/recipe-ratings',
        pathParameters: {
          name: title,
        },
        body: JSON.stringify({ rating }),
      })

      const result = await wrapped.run(event)

      expect(authMock).toHaveBeenCalledTimes(1)
      expect(result.statusCode).toBe(200)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(rateRecipe).toHaveBeenCalledTimes(1)
      expect(rateRecipe).toHaveBeenCalledWith(title, rating)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'ok',
      })
    })

    it('rejects an empty payload', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/recipe-ratings',
        pathParameters: {
          name: title,
        },
        body: '',
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(400)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(rateRecipe).not.toHaveBeenCalled()
    })

    it('requires the admin role', async () => {
      authMock.mockResolvedValueOnce(testUser({ 'https://recipebible.net/roles': ['non-admin'] }))
      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/recipe-ratings',
        pathParameters: {
          name: title,
        },
        body: JSON.stringify({ test: '123' }),
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(403)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(rateRecipe).not.toHaveBeenCalled()
    })
  })
})
