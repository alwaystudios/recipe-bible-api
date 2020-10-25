import request from 'supertest'
import { testRecipes } from '../../test/testRecipes'
import { testApp } from '../../test/testApp'
import config from '../infra/config'
import * as getRecipesModule from './recipeRepository'

const recipes = testRecipes()
const getRecipes = jest.spyOn(getRecipesModule, 'getRecipes').mockResolvedValue(recipes)

describe('GET /api/v2/recipe', () => {
  it('responds with a list of recipes', async () => {
    const app = testApp(config)

    const { status, body } = await request(app).get('/api/v2/recipe')

    expect(status).toEqual(200)
    expect(body).toEqual(recipes)
    expect(getRecipes).toHaveBeenCalledTimes(1)
  })

  it.todo('error scenarios')
})
