import { wrap } from 'lambda-wrapper'
import * as manageRecipeRatings from './manageRecipeRatings'
import * as ratingService from '../domain/ratingService'
import { createAPIGatewayEventMock } from '../../test/factories/proxyEventMock'
import { CORS_HEADERS } from '../constants'

jest.mock('../clients/auth0')

const title = 'my-recipe'
const rating = 5
const wrapped = wrap(manageRecipeRatings, { handler: 'endpoint' })
const rateRecipe = jest.spyOn(ratingService, 'rateRecipe')

describe('manage recipe ratings API', () => {
  afterEach(jest.clearAllMocks)

  describe('POST /recipe-ratings/{name}', () => {
    it('saves a recipe rating', async () => {
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

      expect(result.statusCode).toBe(200)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(rateRecipe).toHaveBeenCalledTimes(1)
      expect(rateRecipe).toHaveBeenCalledWith(title, rating)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'ok',
      })
    })

    it('rejects an empty payload', async () => {
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
  })
})
