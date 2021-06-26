import { createDynamoMockClient, createS3MockClient } from '../../test/factories/testAwsMockClients'
import { testRecipe } from '@alwaystudios/recipe-bible-sdk'
import * as getClientsModule from '../clients/getClients'
import { DDB_TABLE_NAME } from '../constants'
import {
  createRecipe,
  deleteRecipe,
  getRecipe,
  getRecipeQuery,
  getRecipes,
  saveRecipe,
  saveRecipes,
} from './recipeService'
import { lorem } from 'faker'

const rmdir = jest.fn()
jest.spyOn(getClientsModule, 'getS3Client').mockImplementation(() => createS3MockClient({ rmdir }))

const deleteItem = jest.fn()
const getItem = jest.fn()
const putItem = jest.fn()
const query = jest.fn()
jest
  .spyOn(getClientsModule, 'getDynamoClient')
  .mockImplementation(() => createDynamoMockClient({ putItem, query, getItem, deleteItem }))

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
        Item: { recipe },
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

      await expect(saveRecipe(recipe)).rejects.toEqual(
        new Error('Failed to save recipe: missing title')
      )

      expect(putItem).not.toHaveBeenCalled()
    })
  })

  describe('create', () => {
    it('create recipe', async () => {
      putItem.mockResolvedValueOnce(undefined)
      getItem.mockResolvedValueOnce({})

      await createRecipe('  my new recipe  ')

      expect(getItem).toHaveBeenCalledTimes(1)
      expect(getItem).toHaveBeenCalledWith({
        TableName: DDB_TABLE_NAME,
        Key: {
          pk: 'recipe',
          sk: 'my-new-recipe',
        } as any,
      })
      expect(putItem).toHaveBeenCalledTimes(1)
      expect(putItem).toHaveBeenCalledWith(
        {
          pk: 'recipe',
          sk: 'my-new-recipe',
          recipe: { title: 'my-new-recipe' },
        },
        DDB_TABLE_NAME
      )
    })

    it('create recipe throws an error if recipe already exists', async () => {
      const recipe = testRecipe()
      putItem.mockResolvedValueOnce(undefined)
      getItem.mockResolvedValueOnce({
        Item: { recipe },
      })

      await expect(createRecipe(recipe.title)).rejects.toEqual(
        new Error('Failed to create recipe: existing recipe')
      )

      expect(getItem).toHaveBeenCalledTimes(1)
      expect(getItem).toHaveBeenCalledWith({
        TableName: DDB_TABLE_NAME,
        Key: {
          pk: 'recipe',
          sk: recipe.title,
        } as any,
      })
      expect(putItem).not.toHaveBeenCalled()
    })

    it('create recipe throws an error if recipe title missing', async () => {
      await expect(createRecipe('')).rejects.toEqual(
        new Error('Failed to create recipe: missing title')
      )

      expect(putItem).not.toHaveBeenCalled()
      expect(getItem).not.toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('delete a recipe', async () => {
      const title = lorem.word()
      deleteItem.mockResolvedValueOnce(undefined)
      rmdir.mockResolvedValueOnce(undefined)

      await deleteRecipe(title)

      expect(rmdir).toHaveBeenCalledTimes(1)
      expect(rmdir).toHaveBeenCalledWith(`recipes/${title}`)
      expect(deleteItem).toHaveBeenCalledTimes(1)
      expect(deleteItem).toHaveBeenCalledWith({
        Key: {
          pk: 'recipe',
          sk: title,
        },
        TableName: DDB_TABLE_NAME,
      })
    })
  })
})
