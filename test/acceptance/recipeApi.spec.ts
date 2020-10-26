import { testRecipe } from '../testRecipes'
import { getRecipes, postCreateRecipe } from './apiClient'
import faker from 'faker'

describe('recipes', () => {
  it('returns a list of recipes', async () => {
    const response = await getRecipes()
    expect(response.status).toEqual(200)
  })

  it('denies access for invalid access token', async () => {
    const recipe = testRecipe(faker.random.words(3))
    await expect(postCreateRecipe('invalid token', recipe)).rejects.toEqual(Error('Unauthorized'))
  })
})
