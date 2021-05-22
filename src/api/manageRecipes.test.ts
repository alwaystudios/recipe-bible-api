import { wrap } from 'lambda-wrapper'
import * as manageRecipes from './manageRecipes'
import * as recipeService from '../domain/recipeService'
import { testRecipe, testUser } from '../../test/factories/testFactories'
import { createAPIGatewayEventMock } from '../../test/factories/proxyEventMock'
import { verifyAuth0Token } from '../clients/auth0'

jest.mock('../clients/auth0')

const authMock = verifyAuth0Token as jest.Mock
const wrapped = wrap(manageRecipes, { handler: 'endpoint' })
const saveRecipe = jest.spyOn(recipeService, 'saveRecipe')
const saveRecipes = jest.spyOn(recipeService, 'saveRecipes')

describe('manage recipes API', () => {
  afterEach(jest.clearAllMocks)

  describe('POST /recipes', () => {
    it('imports recipes in bulk', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const recipes = [testRecipe(), testRecipe()]
      saveRecipes.mockResolvedValueOnce([])
      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/recipes',
        body: JSON.stringify({ recipes }),
      })

      const result = await wrapped.run(event)

      expect(saveRecipes).toHaveBeenCalledTimes(1)
      expect(saveRecipes).toHaveBeenCalledWith(recipes)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'ok',
      })
    })

    it('rejects an empty payload', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/recipes',
        body: '',
      })

      const result = await wrapped.run(event)

      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(saveRecipes).not.toHaveBeenCalled()
    })

    it('requires the admin role', async () => {
      authMock.mockResolvedValueOnce(testUser({ 'https://recipebible.net/roles': ['non-admin'] }))
      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/recipes',
        body: JSON.stringify({ test: '123' }),
      })

      const result = await wrapped.run(event)

      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(saveRecipes).not.toHaveBeenCalled()
    })
  })

  describe('POST /recipes/{name}', () => {
    it('saves a recipe', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const recipe = testRecipe()
      saveRecipe.mockResolvedValueOnce(undefined)
      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/recipes',
        pathParameters: { name: recipe.title },
        body: JSON.stringify(recipe),
      })

      const result = await wrapped.run(event)

      expect(saveRecipe).toHaveBeenCalledTimes(1)
      expect(saveRecipe).toHaveBeenCalledWith(recipe)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'ok',
      })
    })

    it('rejects an empty payload', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/recipes',
        pathParameters: { name: 'name' },
        body: '',
      })

      const result = await wrapped.run(event)

      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(saveRecipe).not.toHaveBeenCalled()
    })

    it('rejects a title that differs from the slug', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/recipes',
        pathParameters: { name: 'different-slug' },
        body: JSON.stringify(testRecipe()),
      })

      const result = await wrapped.run(event)

      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(saveRecipe).not.toHaveBeenCalled()
    })

    it('requires the admin role', async () => {
      authMock.mockResolvedValueOnce(testUser({ 'https://recipebible.net/roles': ['non-admin'] }))
      const event = createAPIGatewayEventMock({
        httpMethod: 'POST',
        path: '/recipes',
        pathParameters: { name: 'name' },
        body: JSON.stringify({ test: '123' }),
      })

      const result = await wrapped.run(event)

      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(saveRecipe).not.toHaveBeenCalled()
    })
  })

  describe('PUT /recipes/{name}', () => {
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

      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(saveRecipe).not.toHaveBeenCalled()
    })
  })
})
