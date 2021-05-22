import { createDynamoMockClient } from '../../test/factories/testAwsMockClients'
import { testRecipe } from '../../test/factories/testFactories'
import * as getClientsModule from '../clients/getClients'
import { DDB_TABLE_NAME } from '../constants'
import { getRecipe, getRecipeQuery, getRecipes, saveRecipe, saveRecipes } from './recipeService'

const getItem = jest.fn()
const putItem = jest.fn()
const query = jest.fn()
jest
  .spyOn(getClientsModule, 'getDynamoClient')
  .mockImplementation(() => createDynamoMockClient({ putItem, query, getItem }))

describe('recipe service', () => {
  afterEach(jest.clearAllMocks)

  test.each<[boolean, boolean | 'all']>([
    [true, 'all'],
    [true, false],
    [false, false],
    [false, 'all'],
  ])(
    'gets publihsed recipes with all types of focus',
    async (published: boolean, focused: boolean | 'all') => {
      const recipes = [
        testRecipe({ metadata: { published, focused: focused === 'all' ? true : focused } }),
        testRecipe({ metadata: { published, focused: focused === 'all' ? true : focused } }),
      ]
      query.mockResolvedValueOnce({
        Items: recipes.map((recipe) => ({ recipe, sk: recipe.title })),
      })

      const result = await getRecipes({ published, focused })

      expect(result).toMatchObject(recipes)
      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith(getRecipeQuery)
    }
  )

  describe('get recipe', () => {
    it('get single recipe', async () => {
      const recipe = testRecipe()
      getItem.mockResolvedValueOnce({
        Item: recipe,
      })

      const result = await getRecipe('test')

      expect(result).toEqual(recipe)
      expect(getItem).toHaveBeenCalledTimes(1)
      expect(getItem).toHaveBeenCalledWith({
        TableName: DDB_TABLE_NAME,
        Key: {
          pk: 'recipe',
          sk: 'test',
        } as any,
      })
    })

    it('returns undefined if not found', async () => {
      getItem.mockResolvedValueOnce({})

      const result = await getRecipe('test')

      expect(result).toBeUndefined()
      expect(getItem).toHaveBeenCalledTimes(1)
      expect(getItem).toHaveBeenCalledWith({
        TableName: DDB_TABLE_NAME,
        Key: {
          pk: 'recipe',
          sk: 'test',
        } as any,
      })
    })
  })

  describe('save', () => {
    it('save recipes', async () => {
      const recipe1 = testRecipe()
      const recipe2 = testRecipe()
      putItem.mockResolvedValueOnce(undefined)

      await saveRecipes([recipe1, recipe2])

      expect(putItem).toHaveBeenCalledTimes(2)
      expect(putItem).toHaveBeenNthCalledWith(
        1,
        {
          pk: 'recipe',
          sk: recipe1.title,
          recipe: recipe1,
        },
        DDB_TABLE_NAME
      )
      expect(putItem).toHaveBeenNthCalledWith(
        2,
        {
          pk: 'recipe',
          sk: recipe2.title,
          recipe: recipe2,
        },
        DDB_TABLE_NAME
      )
    })

    it('save recipe', async () => {
      const recipe = testRecipe()
      putItem.mockResolvedValueOnce(undefined)

      await saveRecipe(recipe)

      expect(putItem).toHaveBeenCalledTimes(1)
      expect(putItem).toHaveBeenCalledWith(
        {
          pk: 'recipe',
          sk: recipe.title,
          recipe,
        },
        DDB_TABLE_NAME
      )
    })

    it('save recipe throws an error if no title provided', async () => {
      const recipe = testRecipe({ title: '' })
      putItem.mockResolvedValueOnce(undefined)

      await expect(saveRecipe(recipe)).rejects.toEqual(new Error('Missing title'))

      expect(putItem).not.toHaveBeenCalled()
    })
  })
})
