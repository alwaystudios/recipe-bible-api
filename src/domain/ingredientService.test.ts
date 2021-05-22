import { random } from 'faker'
import { createDynamoMockClient } from '../../test/factories/testAwsMockClients'
import * as getClientsModule from '../clients/getClients'
import { DDB_TABLE_NAME } from '../constants'
import { getIngredients, saveIngredient, saveIngredients } from './ingredientService'

const INGREDIENTS = 'ingredients'
const getItem = jest.fn()
const putItem = jest.fn()
jest
  .spyOn(getClientsModule, 'getDynamoClient')
  .mockImplementation(() => createDynamoMockClient({ putItem, getItem }))

describe('ingredient service', () => {
  afterEach(jest.clearAllMocks)

  it('save ingredients', async () => {
    const ingredient1 = random.word()
    const ingredient2 = random.word()
    const ingredients = [ingredient1, ingredient2]
    putItem.mockResolvedValueOnce(undefined)

    await saveIngredients(ingredients)

    expect(putItem).toHaveBeenCalledTimes(1)
    expect(putItem).toHaveBeenCalledWith(
      {
        pk: INGREDIENTS,
        sk: INGREDIENTS,
        ingredients,
      },
      DDB_TABLE_NAME
    )
  })

  it('saves a new ingredient', async () => {
    const ingredient1 = random.word()
    const ingredient2 = random.word()
    const ingredients = [ingredient1, ingredient2]
    getItem.mockResolvedValueOnce({ Items: { ingredients } })
    putItem.mockResolvedValueOnce(undefined)

    await saveIngredient('new')

    expect(getItem).toHaveBeenCalledTimes(1)
    expect(getItem).toHaveBeenCalledWith({
      TableName: DDB_TABLE_NAME,
      Key: {
        pk: INGREDIENTS,
        sk: INGREDIENTS,
      } as any,
    })
    expect(putItem).toHaveBeenCalledTimes(1)
    expect(putItem).toHaveBeenCalledWith(
      {
        pk: INGREDIENTS,
        sk: INGREDIENTS,
        ingredients: [...ingredients, 'new'],
      },
      DDB_TABLE_NAME
    )
  })

  it('save ingredient ignores an existing ingredient', async () => {
    const ingredient1 = random.word()
    const ingredient2 = random.word()
    const ingredients = [ingredient1, ingredient2]
    getItem.mockResolvedValueOnce({ Items: { ingredients } })
    putItem.mockResolvedValueOnce(undefined)

    await saveIngredient(ingredient1)

    expect(getItem).toHaveBeenCalledTimes(1)
    expect(getItem).toHaveBeenCalledWith({
      TableName: DDB_TABLE_NAME,
      Key: {
        pk: INGREDIENTS,
        sk: INGREDIENTS,
      } as any,
    })
    expect(putItem).toHaveBeenCalledTimes(1)
    expect(putItem).toHaveBeenCalledWith(
      {
        pk: INGREDIENTS,
        sk: INGREDIENTS,
        ingredients,
      },
      DDB_TABLE_NAME
    )
  })

  it('get ingredients', async () => {
    const ingredient1 = random.word()
    const ingredient2 = random.word()
    const ingredients = [ingredient1, ingredient2]
    getItem.mockResolvedValueOnce({ Items: { ingredients } })

    const result = await getIngredients()

    expect(result).toEqual(ingredients)
    expect(getItem).toHaveBeenCalledTimes(1)
    expect(getItem).toHaveBeenCalledWith({
      TableName: DDB_TABLE_NAME,
      Key: {
        pk: INGREDIENTS,
        sk: INGREDIENTS,
      } as any,
    })
  })
})
