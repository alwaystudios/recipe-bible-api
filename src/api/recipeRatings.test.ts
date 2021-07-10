import { wrap } from 'lambda-wrapper'
import * as recipeRatings from './recipeRatings'
import * as ingredientService from '../domain/ratingService'
import { createAPIGatewayEventMock } from '../../test/factories/proxyEventMock'
import { random } from 'faker'
import { CORS_HEADERS } from '../constants'
import * as loggerModule from '../clients/logger'
import { testLogger } from '../../test/factories/testLogger'

const err = jest.fn()
jest.spyOn(loggerModule, 'getLogger').mockReturnValue(testLogger({ err }))

const title = 'my-recipe'
const wrapped = wrap(recipeRatings, { handler: 'endpoint' })
const getRecipeRatings = jest.spyOn(ingredientService, 'getRecipeRatings')

describe('recipe ratings API', () => {
  describe('GET /recipe-ratings', () => {
    it('returns all ingredients', async () => {
      const data = [random.word(), random.word()]
      getRecipeRatings.mockResolvedValueOnce(data)
      const event = createAPIGatewayEventMock({
        httpMethod: 'GET',
        path: '/recipe-ratings',
        pathParameters: {
          name: title,
        },
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(200)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(getRecipeRatings).toHaveBeenCalledTimes(1)
      expect(getRecipeRatings).toHaveBeenCalledWith(title)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'ok',
        data,
      })
    })

    it('handles errors', async () => {
      getRecipeRatings.mockRejectedValueOnce(new Error('boom'))
      const event = createAPIGatewayEventMock({
        httpMethod: 'GET',
        path: '/recipe-ratings',
        pathParameters: {
          name: title,
        },
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(500)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(err).toHaveBeenCalledTimes(1)
      expect(err).toHaveBeenCalledWith('Server error: Error: boom')
    })
  })
})
