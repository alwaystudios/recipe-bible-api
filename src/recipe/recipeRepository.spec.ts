import * as asPg from '@alwaystudios/as-pg'
import { testRecipes } from '../../test/testRecipes'
import { getRecipes } from './recipeRepository'

const recipes = testRecipes()
const query = jest.fn().mockResolvedValue({ rows: recipes })
const testClient = asPg.testPgClient({ query })
const testPool = asPg.testConnectionPool()

const runInPoolClientSpy = jest
  .spyOn(asPg, 'runInPoolClient')
  .mockImplementation(() => asPg.testRunInPoolClient(testClient))

describe('recipe repository', () => {
  beforeEach(jest.clearAllMocks)

  it('getRecipes', async () => {
    const result = await getRecipes(testPool)
    expect(runInPoolClientSpy).toHaveBeenCalledTimes(1)
    expect(runInPoolClientSpy).toHaveBeenCalledWith(testPool)
    expect(query).toHaveBeenCalledTimes(1)
    expect(query).toHaveBeenLastCalledWith(
      `select title from recipe where coalesce(details->'metadata'->'reviewed', 'false') = 'true'`,
    )
    expect(result).toEqual(recipes)
  })
})
