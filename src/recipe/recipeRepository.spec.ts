import * as asPg from '@alwaystudios/as-pg'
import { omit } from 'ramda'
import { testLog } from '../../test/testLog'
import { testRecipe, testRecipes } from '../../test/testRecipes'
import { createRecipe, getRecipes } from './recipeRepository'

const recipes = testRecipes()
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
    query.mockResolvedValueOnce({ rows: recipes })
    const result = await getRecipes(testPool)
    expect(runInPoolClientSpy).toHaveBeenCalledTimes(1)
    expect(runInPoolClientSpy).toHaveBeenCalledWith(testPool)
    expect(query).toHaveBeenCalledTimes(1)
    expect(query).toHaveBeenLastCalledWith(
      `select title from recipe where coalesce(details->'metadata'->'reviewed', 'false') = 'true'`,
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
})
