import { getRecipes, patchUpdateRecipe, postCreateRecipe } from './apiClient'
import faker from 'faker'
import { testRecipe } from '@alwaystudios/recipe-bible-sdk'

describe('recipes', () => {
  it('returns a list of recipes', async () => {
    const response = await getRecipes()
    expect(response.status).toEqual(200)
  })

  it.todo('successful create recipe')

  it('denies access for invalid access token on create', async () => {
    const recipe = testRecipe(faker.random.words(3))
    await expect(postCreateRecipe('invalid token', recipe)).rejects.toEqual(Error('Unauthorized'))
  })

  it.todo('successful update recipe')

  it('denies access for invalid access token on update', async () => {
    const recipe = testRecipe(faker.random.words(3))
    await expect(patchUpdateRecipe('invalid token', recipe)).rejects.toEqual(Error('Unauthorized'))
  })
})
