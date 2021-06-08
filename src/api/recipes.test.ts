import { wrap } from 'lambda-wrapper'
import * as recipes from './recipes'
import * as recipeService from '../domain/recipeService'
import { testRecipe } from '@alwaystudios/recipe-bible-sdk'
import { createAPIGatewayEventMock } from '../../test/factories/proxyEventMock'
import { toApiRecipeResponseData } from './recipeTransformer'

const wrapped = wrap(recipes, { handler: 'endpoint' })
const getRecipes = jest.spyOn(recipeService, 'getRecipes')
const getRecipe = jest.spyOn(recipeService, 'getRecipe')

describe('recipes API', () => {
  beforeEach(jest.clearAllMocks)

  describe('GET /recipes', () => {
    it('returns all recipes', async () => {
      const data = [testRecipe(), testRecipe()]
      getRecipes.mockResolvedValueOnce(data)
      const event = createAPIGatewayEventMock({
        httpMethod: 'GET',
        path: '/recipes',
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(200)
      expect(getRecipes).toHaveBeenCalledTimes(1)
      expect(getRecipes).toHaveBeenCalledWith({ focused: 'all', published: true })
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'ok',
        data,
      })
    })

    it('returns all recipes limited to specific fields', async () => {
      const field = ['title', 'imgSrc']
      const data = [testRecipe(), testRecipe()]
      getRecipes.mockResolvedValueOnce(data)
      const event = createAPIGatewayEventMock({
        httpMethod: 'GET',
        path: '/recipes',
        multiValueQueryStringParameters: {
          field,
        },
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(200)
      expect(getRecipes).toHaveBeenCalledTimes(1)
      expect(getRecipes).toHaveBeenCalledWith({ focused: 'all', published: true })
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'ok',
        data: toApiRecipeResponseData(data, field),
      })
    })

    it('handles errors', async () => {
      getRecipes.mockRejectedValueOnce(new Error('boom'))
      const event = createAPIGatewayEventMock({
        httpMethod: 'GET',
        path: '/recipes',
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(500)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
    })
  })

  describe('GET /recipes/{name}', () => {
    it('returns a single recipe', async () => {
      const data = testRecipe()
      getRecipe.mockResolvedValueOnce(data)
      const event = createAPIGatewayEventMock({
        httpMethod: 'GET',
        path: '/recipes',
        pathParameters: { name: 'test' },
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(200)
      expect(getRecipe).toHaveBeenCalledTimes(1)
      expect(getRecipe).toHaveBeenCalledWith('test')
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'ok',
        data,
      })
    })

    it('returns a single recipe limited to specific fields', async () => {
      const field = ['title', 'imgSrc']
      const data = testRecipe()
      getRecipe.mockResolvedValueOnce(data)
      const event = createAPIGatewayEventMock({
        httpMethod: 'GET',
        path: '/recipes',
        pathParameters: { name: 'test' },
        multiValueQueryStringParameters: { field },
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(200)
      expect(getRecipe).toHaveBeenCalledTimes(1)
      expect(getRecipe).toHaveBeenCalledWith('test')
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'ok',
        data: toApiRecipeResponseData(data, field),
      })
    })

    it('returns 404 if not found', async () => {
      getRecipe.mockResolvedValueOnce(undefined)
      const event = createAPIGatewayEventMock({
        httpMethod: 'GET',
        path: '/recipes',
        pathParameters: { name: 'test' },
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(404)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
    })
  })
})
