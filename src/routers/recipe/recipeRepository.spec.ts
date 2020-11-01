import * as asPg from '@alwaystudios/as-pg'
import { testRecipes, testRecipe } from '@alwaystudios/recipe-bible-sdk'
import { omit } from 'ramda'
import { testLog } from '../../../test/testLog'
import { createRecipe, getRecipes, updateRecipe } from './recipeRepository'

const recipes = testRecipes()
const recipeRecords = recipes.map((r) => ({
  title: r.title,
  img_src: r.imgSrc,
  categories: r.categories,
  metadata: r.metadata,
  ingredients: r.ingredients.map((i) => ({ name: i, quantity: 2 })),
}))
const query = jest.fn()
const testClient = asPg.testPgClient({ query })
const testPool = asPg.testConnectionPool()
const err = jest.fn()
const log = testLog({ err })
const userId = 'abc-1234'

const runInPoolClientSpy = jest
  .spyOn(asPg, 'runInPoolClient')
  .mockImplementation(() => asPg.testRunInPoolClient(testClient))

describe('recipe repository', () => {
  beforeEach(jest.clearAllMocks)

  it('getRecipes', async () => {
    query.mockResolvedValueOnce({ rows: recipeRecords })
    const result = await getRecipes(testPool)
    expect(runInPoolClientSpy).toHaveBeenCalledTimes(1)
    expect(runInPoolClientSpy).toHaveBeenCalledWith(testPool)
    expect(query).toHaveBeenCalledTimes(1)
    expect(query).toHaveBeenCalledWith(
      `select 
          title, 
          details->'imgSrc' as img_src, 
          details->'categories' as categories, 
          details->'ingredients' as ingredients, 
          details->'metadata' as metadata 
        from recipe where coalesce(details->'metadata'->'published', 'false') = 'true'`,
    )
    expect(result).toEqual(recipes)
  })

  describe('createRecipe', () => {
    it('creates a recipe', async () => {
      query.mockResolvedValueOnce({ rows: [{ id: 1 }] })
      const title = 'my-test-recipe'
      const recipe = testRecipe(title)
      const recipeRecord = omit(['id, title'], recipe)
      const result = await createRecipe(log, testPool, title, userId, recipe)
      expect(runInPoolClientSpy).toHaveBeenCalledTimes(1)
      expect(runInPoolClientSpy).toHaveBeenCalledWith(testPool)
      expect(query).toHaveBeenCalledTimes(1)
      expect(
        query,
      ).toHaveBeenLastCalledWith(
        'insert into recipe (title, details, userId) values ($1, $2, $3) returning id',
        [title, recipeRecord, userId],
      )
      expect(result).toEqual(1)
    })

    it('logs an error on failure', async () => {
      query.mockRejectedValueOnce('boom')
      const title = 'my-test-recipe'
      const recipe = testRecipe(title)
      await expect(createRecipe(log, testPool, title, userId, recipe)).rejects.toEqual(
        new Error('repository error'),
      )
      expect(err).toHaveBeenCalledTimes(1)
      expect(err).toHaveBeenCalledWith('boom')
    })
  })

  describe('updateRecipe', () => {
    it('updates a recipe', async () => {
      query.mockResolvedValueOnce({ rows: [], rowCount: 1 })
      const title = 'my-test-recipe'
      const recipe = testRecipe(title)
      const recipeRecord = omit(['id, title'], recipe)
      await updateRecipe(log, testPool, 1, userId, recipeRecord)
      expect(runInPoolClientSpy).toHaveBeenCalledTimes(1)
      expect(runInPoolClientSpy).toHaveBeenCalledWith(testPool)
      expect(query).toHaveBeenCalledTimes(1)
      expect(
        query,
      ).toHaveBeenLastCalledWith('update recipe set details = $1 where id = $2 and userId = $3', [
        recipeRecord,
        1,
        userId,
      ])
    })

    it('logs an error when rowCount = 0', async () => {
      query.mockResolvedValueOnce({ rows: [], rowCount: 0 })
      const title = 'my-test-recipe'
      const recipe = testRecipe(title)
      const error = Error('Expected update recipe to have row count of at least one')
      await expect(updateRecipe(log, testPool, 1, userId, recipe)).rejects.toEqual(
        new Error('repository error'),
      )
      expect(err).toHaveBeenCalledTimes(1)
      expect(err).toHaveBeenCalledWith(error)
    })

    it('logs an error on failure', async () => {
      query.mockRejectedValueOnce('boom')
      const title = 'my-test-recipe'
      const recipe = testRecipe(title)
      await expect(updateRecipe(log, testPool, 1, userId, recipe)).rejects.toEqual(
        new Error('repository error'),
      )
      expect(err).toHaveBeenCalledTimes(1)
      expect(err).toHaveBeenCalledWith('boom')
    })
  })
})
