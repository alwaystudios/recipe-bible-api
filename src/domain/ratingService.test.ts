import { random } from 'faker'
import { createDynamoMockClient } from '../../test/factories/testAwsMockClients'
import * as getClientsModule from '../clients/getClients'
import { DDB_TABLE_NAME } from '../constants'
import { getRecipeRatings, rateRecipe } from './ratingService'
import { kebabify, testRecipe } from '@alwaystudios/recipe-bible-sdk'
import { mocked } from 'ts-jest/utils'
import { v4 } from 'uuid'
import * as recipeService from './recipeService'

const getRecipe = jest.spyOn(recipeService, 'getRecipe')

jest.mock('uuid')
mocked(v4).mockReturnValue('1234')

const title = random.words(3)
const rating = 5

const RECIPE_RATING = 'recipe-rating'
const query = jest.fn()
const putItem = jest.fn()
jest
  .spyOn(getClientsModule, 'getDynamoClient')
  .mockImplementation(() => createDynamoMockClient({ putItem, query }))

describe('rating service', () => {
  afterEach(jest.clearAllMocks)

  describe('rate a recipe', () => {
    it('rate a recipe', async () => {
      putItem.mockResolvedValueOnce(undefined)
      getRecipe.mockResolvedValueOnce(testRecipe())

      await rateRecipe(title, rating)

      expect(putItem).toHaveBeenCalledTimes(1)
      expect(putItem).toHaveBeenCalledWith(
        {
          pk: RECIPE_RATING,
          sk: `${kebabify(title)}#1234`,
          rating,
        },
        DDB_TABLE_NAME
      )
      expect(getRecipe).toHaveBeenCalledTimes(1)
      expect(getRecipe).toHaveBeenCalledWith(kebabify(title))
    })

    it('throws an error if recipe does not exist', async () => {
      putItem.mockResolvedValueOnce(undefined)
      getRecipe.mockResolvedValueOnce(undefined)

      await expect(rateRecipe(title, rating)).rejects.toEqual(
        new Error('Failed to rate recipe: recipe not found')
      )

      expect(putItem).not.toHaveBeenCalled()
    })

    test.each([[undefined], [null], [''], ['   ']])(
      'throws an error if title %s',
      async (title: any) => {
        await expect(rateRecipe(title, rating)).rejects.toEqual(
          new Error('Failed to rate recipe: missing title')
        )

        expect(putItem).not.toHaveBeenCalled()
      }
    )
  })

  describe('get recipe ratings', () => {
    it('gets the ratings for a recipe', async () => {
      query.mockResolvedValueOnce({ Items: [{ rating: 1 }, { rating: 2 }, { rating: 4 }] })
      const ratings = await getRecipeRatings(title)
      expect(ratings).toEqual([1, 2, 4])
      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith({
        TableName: DDB_TABLE_NAME,
        KeyConditionExpression: '#pk = :pk and begins_with(#sk, :sk)',
        ExpressionAttributeNames: {
          '#pk': 'pk',
          '#sk': 'sk',
        },
        ExpressionAttributeValues: {
          ':pk': RECIPE_RATING,
          ':sk': `${kebabify(title)}#`,
        },
      })
    })
  })
})
