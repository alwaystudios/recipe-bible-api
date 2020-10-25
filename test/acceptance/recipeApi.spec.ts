import { testRecipe } from '../testRecipes'
import { login, getRecipes, postCreateRecipe } from './apiClient'
import faker from 'faker'

describe('recipes', () => {
  it('returns a list of recipes', async () => {
    const response = await getRecipes()
    expect(response.status).toEqual(200)
  })

  it('creates a recipe when logged in', async () => {
    const recipe = testRecipe(faker.random.words(3))
    await login().then(async (token) => {
      const response = await postCreateRecipe(token, recipe)
      expect(response.body).toEqual({ id: expect.any(String) })
      expect(response.status).toEqual(201)
    })
  })

  it('denies access when not logged in', async () => {
    const recipe = testRecipe(faker.random.words(3))
    await expect(postCreateRecipe('invalid token', recipe)).rejects.toEqual(Error('Unauthorized'))
  })
})
