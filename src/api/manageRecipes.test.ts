import { wrap } from 'lambda-wrapper'
import * as manageRecipes from './manageRecipes'
import * as recipeService from '../domain/recipeService'
import { testRecipe, testUser } from '@alwaystudios/recipe-bible-sdk'
import { createAPIGatewayEventMock } from '../../test/factories/proxyEventMock'
import { verifyAuth0Token } from '../clients/auth0'
import * as loggerModule from '../clients/logger'
import { testLogger } from '../../test/factories/testLogger'

jest.mock('../clients/auth0')

const err = jest.fn()
jest.spyOn(loggerModule, 'getLogger').mockReturnValue(testLogger({ err }))

const authMock = verifyAuth0Token as jest.Mock
const wrapped = wrap(manageRecipes, { handler: 'endpoint' })
const saveRecipe = jest.spyOn(recipeService, 'saveRecipe')
const saveRecipes = jest.spyOn(recipeService, 'saveRecipes')
const createRecipe = jest.spyOn(recipeService, 'createRecipe')

describe('manage recipes API', () => {
  afterEach(jest.clearAllMocks)

  describe('PUT /recipes', () => {
    it('imports recipes in bulk', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const recipes = [testRecipe(), testRecipe()]
      saveRecipes.mockResolvedValueOnce([])
      const event = createAPIGatewayEventMock({
        httpMethod: 'PUT',
        path: '/recipes',
        body: JSON.stringify({ recipes }),
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(200)
      expect(saveRecipes).toHaveBeenCalledTimes(1)
      expect(saveRecipes).toHaveBeenCalledWith(recipes)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'ok',
      })
    })

    it('rejects an empty payload', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const event = createAPIGatewayEventMock({
        httpMethod: 'PUT',
        path: '/recipes',
        body: '',
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(400)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(saveRecipes).not.toHaveBeenCalled()
      expect(err).toHaveBeenCalledTimes(1)
      expect(err).toHaveBeenCalledWith('manage recipe error, missing body')
    })

    it('requires the admin role', async () => {
      authMock.mockResolvedValueOnce(testUser({ 'https://recipebible.net/roles': ['non-admin'] }))
      const event = createAPIGatewayEventMock({
        httpMethod: 'PUT',
        path: '/recipes',
        body: JSON.stringify({ test: '123' }),
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(403)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(saveRecipes).not.toHaveBeenCalled()
    })
  })

  describe('PUT /recipes/', () => {
    it('saves a recipe', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const recipe = testRecipe()
      saveRecipe.mockResolvedValueOnce(undefined)
      const event = createAPIGatewayEventMock({
        httpMethod: 'PUT',
        path: '/recipes',
        pathParameters: { name: recipe.title },
        body: JSON.stringify(recipe),
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(200)
      expect(saveRecipe).toHaveBeenCalledTimes(1)
      expect(saveRecipe).toHaveBeenCalledWith(recipe)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'ok',
      })
    })

    it('rejects an empty payload', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const event = createAPIGatewayEventMock({
        httpMethod: 'PUT',
        path: '/recipes',
        pathParameters: { name: 'name' },
        body: '',
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(400)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(saveRecipe).not.toHaveBeenCalled()
    })

    it('rejects a title that differs from the slug', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const event = createAPIGatewayEventMock({
        httpMethod: 'PUT',
        path: '/recipes',
        pathParameters: { name: 'different-slug' },
        body: JSON.stringify(testRecipe()),
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(400)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(saveRecipe).not.toHaveBeenCalled()
    })

    it('requires the admin role', async () => {
      authMock.mockResolvedValueOnce(testUser({ 'https://recipebible.net/roles': ['non-admin'] }))
      const event = createAPIGatewayEventMock({
        httpMethod: 'PUT',
        path: '/recipes',
        pathParameters: { name: 'name' },
        body: JSON.stringify({ test: '123' }),
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(403)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(saveRecipe).not.toHaveBeenCalled()
    })
  })

  describe('POST /recipes', () => {
    it('create a new recipe', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const title = 'my new recipe'
      createRecipe.mockResolvedValueOnce(undefined)
      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/recipes',
        body: JSON.stringify({ title }),
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(200)
      expect(createRecipe).toHaveBeenCalledTimes(1)
      expect(createRecipe).toHaveBeenCalledWith(title)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'ok',
      })
    })

    it('rejects when recipe already exists', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const title = 'my new recipe'
      createRecipe.mockRejectedValueOnce(new Error('existing recipe'))
      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/recipes',
        body: JSON.stringify({ title }),
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(400)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(createRecipe).toHaveBeenCalledTimes(1)
      expect(createRecipe).toHaveBeenCalledWith(title)
      expect(err).toHaveBeenCalledTimes(1)
      expect(err).toHaveBeenCalledWith('manage recipe error, existing recipe')
    })

    it('rejects an empty payload', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/recipes',
        body: '',
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(400)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(createRecipe).not.toHaveBeenCalled()
      expect(err).toHaveBeenCalledTimes(1)
      expect(err).toHaveBeenCalledWith('manage recipe error, missing body')
    })

    it('requires the admin role', async () => {
      authMock.mockResolvedValueOnce(testUser({ 'https://recipebible.net/roles': ['non-admin'] }))
      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/recipes',
        body: JSON.stringify({ test: '123' }),
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(403)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(createRecipe).not.toHaveBeenCalled()
    })

    it('returns 404 when used with slug', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/recipes',
        pathParameters: { name: 'recipe-slug' },
        body: JSON.stringify({ test: '123' }),
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(404)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(createRecipe).not.toHaveBeenCalled()
    })
  })
})
