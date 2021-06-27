import { wrap } from 'lambda-wrapper'
import * as recipes from './recipes'
import * as recipeService from '../domain/recipeService'
import { testRecipe } from '@alwaystudios/recipe-bible-sdk'
import { createAPIGatewayEventMock } from '../../test/factories/proxyEventMock'
import { toApiRecipeResponseData } from './recipeTransformer'
import { CORS_HEADERS } from '../constants'
import * as loggerModule from '../clients/logger'
import { testLogger } from '../../test/factories/testLogger'

const err = jest.fn()
jest.spyOn(loggerModule, 'getLogger').mockReturnValue(testLogger({ err }))

const wrapped = wrap(recipes, { handler: 'endpoint' })
const getRecipes = jest.spyOn(recipeService, 'getRecipes')
const getRecipe = jest.spyOn(recipeService, 'getRecipe')

describe('recipes API', () => {
  beforeEach(jest.clearAllMocks)

  describe('GET /recipes', () => {
    it('returns all published recipes', async () => {
      const data = [testRecipe(), testRecipe()]
      getRecipes.mockResolvedValueOnce(data)
      const event = createAPIGatewayEventMock({
        httpMethod: 'GET',
        path: '/recipes',
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(200)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(getRecipes).toHaveBeenCalledTimes(1)
      expect(getRecipes).toHaveBeenCalledWith({ focused: 'all', published: true })
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'ok',
        data,
      })
    })

    test.each([
      ['true', 'all'],
      ['true', 'false'],
      ['true', 'true'],
      ['all', 'false'],
      ['all', 'true'],
      ['all', 'all'],
      ['false', 'false'],
      ['false', 'all'],
      ['false', 'true'],
    ])('returns published: %s, focused: %s', async (published: string, focused: string) => {
      const data = [testRecipe(), testRecipe()]
      getRecipes.mockResolvedValueOnce(data)
      const event = createAPIGatewayEventMock({
        httpMethod: 'GET',
        path: '/recipes',
        queryStringParameters: {
          published,
          focused,
        },
      })

      const result = await wrapped.run(event)

      const _focused = focused === 'all' ? 'all' : focused === 'true'
      const _published = published === 'all' ? 'all' : published === 'true'

      expect(result.statusCode).toBe(200)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(getRecipes).toHaveBeenCalledTimes(1)
      expect(getRecipes).toHaveBeenCalledWith({ focused: _focused, published: _published })
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
      expect(result.headers).toEqual(CORS_HEADERS)
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
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(err).toHaveBeenCalledTimes(1)
      expect(err).toHaveBeenCalledWith('Server error: Error: boom')
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
      expect(result.headers).toEqual(CORS_HEADERS)
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
      expect(result.headers).toEqual(CORS_HEADERS)
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
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
    })
  })
})
