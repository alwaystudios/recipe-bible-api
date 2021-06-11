import { wrap } from 'lambda-wrapper'
import * as ingredients from './ingredients'
import * as ingredientService from '../domain/ingredientService'
import { createAPIGatewayEventMock } from '../../test/factories/proxyEventMock'
import { random } from 'faker'
import { CORS_HEADERS } from '../constants'

const wrapped = wrap(ingredients, { handler: 'endpoint' })
const getIngredients = jest.spyOn(ingredientService, 'getIngredients')

describe('ingredients API', () => {
  describe('GET /ingredients', () => {
    it('returns all ingredients', async () => {
      const data = [random.word(), random.word()]
      getIngredients.mockResolvedValueOnce(data)
      const event = createAPIGatewayEventMock({
        httpMethod: 'GET',
        path: '/ingredients',
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(200)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(getIngredients).toHaveBeenCalledTimes(1)
      expect(getIngredients).toHaveBeenCalledWith()
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'ok',
        data,
      })
    })

    it('handles errors', async () => {
      getIngredients.mockRejectedValueOnce(new Error('boom'))
      const event = createAPIGatewayEventMock({
        httpMethod: 'GET',
        path: '/ingredients',
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(500)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
    })
  })
})
