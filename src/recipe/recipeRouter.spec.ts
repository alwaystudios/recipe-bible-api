import request from 'supertest'
import { testApp } from '../../test/testApp'
import config from '../infra/config'
import * as recipeRepository from './recipeRepository'
import { testLog } from '../../test/testLog'
import { testConnectionPool } from '@alwaystudios/as-pg'
import * as authMiddleware from '../server/authMiddleware'
import { fakeCheckJwt } from '../../test/testAuthMiddleware'
import { testRecipes, testRecipe } from '@alwaystudios/recipe-bible-sdk'

const fakeAuth = jest.spyOn(authMiddleware, 'checkJwt').mockImplementation(fakeCheckJwt)
const log = testLog()
const pool = testConnectionPool()
const recipes = testRecipes()
const getRecipes = jest.spyOn(recipeRepository, 'getRecipes').mockResolvedValue(recipes)
const createRecipe = jest.spyOn(recipeRepository, 'createRecipe').mockResolvedValue(1)

describe('recipeRouter', () => {
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
      const recipe = testRecipe('soup')

      const { status, body } = await request(app).post('/api/v2/recipe').send(recipe)

      expect(status).toEqual(201)
      expect(body).toEqual({ id: 1 })
      expect(createRecipe).toHaveBeenCalledTimes(1)
      expect(createRecipe).toHaveBeenLastCalledWith(
        log,
        pool,
        'soup',
        'todo: get userId from session',
        recipe,
      )
      expect(fakeAuth).toHaveBeenCalledTimes(1)
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
})
