import request from 'supertest'
import { testApp } from '../../test/testApp'
import config from '../infra/config'
import * as recipeRepository from './recipeRepository'
import { testLog } from '../../test/testLog'
import { testConnectionPool } from '@alwaystudios/as-pg'
import * as authMiddleware from '../server/authMiddleware'
import { fakeCheckJwt, fakeUserMiddleware } from '../../test/testAuthMiddleware'
import * as sdk from '@alwaystudios/recipe-bible-sdk'
import { omit } from 'ramda'

const recipe = { ...sdk.testRecipe('recipe-router'), id: 1 }
const validateRecipeSchema = jest.spyOn(sdk, 'validateRecipeSchema').mockReturnValue(recipe)
const validateRecipe = jest.spyOn(sdk, 'validateRecipe').mockReturnValue(null)
const fakeAuth = jest.spyOn(authMiddleware, 'checkJwt').mockImplementation(fakeCheckJwt)
const userMiddleware = jest
  .spyOn(authMiddleware, 'userMiddleware')
  .mockImplementation(fakeUserMiddleware)
const log = testLog()
const pool = testConnectionPool()
const recipes = sdk.testRecipes()
const getRecipes = jest.spyOn(recipeRepository, 'getRecipes').mockResolvedValue(recipes)
const createRecipe = jest.spyOn(recipeRepository, 'createRecipe').mockResolvedValue(1)
const updateRecipe = jest.spyOn(recipeRepository, 'updateRecipe').mockResolvedValue()

describe('recipeRouter', () => {
  beforeEach(jest.clearAllMocks)

  it('PUT method not allowed', async () => {
    const app = testApp(config)

    const { status } = await request(app).put('/api/v2/recipe')

    expect(status).toEqual(405)
  })

  describe('GET /api/v2/recipe', () => {
    it('responds with a list of recipes', async () => {
      const app = testApp(config)

      const { status, body } = await request(app).get('/api/v2/recipe')

      expect(status).toEqual(200)
      expect(body).toEqual(recipes)
      expect(getRecipes).toHaveBeenCalledTimes(1)
      expect(fakeAuth).not.toHaveBeenCalled()
    })

    it('handles failures', async () => {
      const err = jest.fn()
      const error = Error('boom')
      getRecipes.mockRejectedValueOnce(error)
      const app = testApp(config, testLog({ err }))
      const { status } = await request(app).get('/api/v2/recipe')

      expect(status).toBe(500)
      expect(err).toHaveBeenCalledTimes(1)
      expect(err).toHaveBeenCalledWith('Service error, url: GET /api/v2/recipe', error)
    })
  })

  describe('POST /api/v2/recipe', () => {
    it('creates a new recipe', async () => {
      const app = testApp(config, log, pool)
      const { status, body } = await request(app).post('/api/v2/recipe').send(recipe)

      expect(status).toEqual(201)
      expect(body).toEqual({ id: 1 })
      expect(createRecipe).toHaveBeenCalledTimes(1)
      expect(createRecipe).toHaveBeenLastCalledWith(log, pool, recipe.title, 'test-abc', recipe)
      expect(fakeAuth).toHaveBeenCalledTimes(1)
      expect(userMiddleware).toHaveBeenCalledTimes(1)
      expect(validateRecipeSchema).toHaveBeenCalledTimes(1)
      expect(validateRecipeSchema).toHaveBeenLastCalledWith(recipe)
    })

    it('handles failures', async () => {
      const err = jest.fn()
      const error = Error('boom')
      createRecipe.mockRejectedValueOnce(error)
      const app = testApp(config, testLog({ err }))
      const { status } = await request(app).post('/api/v2/recipe').send({})

      expect(status).toBe(500)
      expect(err).toHaveBeenCalledTimes(1)
      expect(err).toHaveBeenCalledWith('Service error, url: POST /api/v2/recipe', error)
    })
  })

  describe('PATCH /api/v2/recipe', () => {
    it('updates a recipe', async () => {
      fakeAuth.mockImplementationOnce(fakeCheckJwt)
      const app = testApp(config, log, pool)
      const { status } = await request(app).patch('/api/v2/recipe').send(recipe)

      expect(status).toEqual(200)
      expect(updateRecipe).toHaveBeenCalledTimes(1)
      expect(updateRecipe).toHaveBeenLastCalledWith(
        log,
        pool,
        1,
        'test-abc',
        omit(['title, id'], recipe),
      )
      expect(fakeAuth).toHaveBeenCalledTimes(1)
      expect(userMiddleware).toHaveBeenCalledTimes(1)
      expect(validateRecipeSchema).toHaveBeenCalledTimes(1)
      expect(validateRecipeSchema).toHaveBeenLastCalledWith(recipe)
      expect(validateRecipe).toHaveBeenCalledTimes(1)
      expect(validateRecipe).toHaveBeenLastCalledWith(recipe)
    })

    it('handles failures', async () => {
      const err = jest.fn()
      const error = Error('boom')
      updateRecipe.mockRejectedValueOnce(error)
      const app = testApp(config, testLog({ err }))
      const { status } = await request(app).patch('/api/v2/recipe').send({})

      expect(status).toBe(500)
      expect(err).toHaveBeenCalledTimes(1)
      expect(err).toHaveBeenCalledWith('Service error, url: PATCH /api/v2/recipe', error)
    })
  })
})
