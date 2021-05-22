import { pathOr } from 'ramda'
import { DynamoClient } from '../clients/dynamoClient'
import { getDynamoClient } from '../clients/getClients'
import { DDB_TABLE_NAME } from '../constants'

const INGREDIENTS = 'ingredients'

const saveAllIngredients = async (
  ingredients: string[],
  client: DynamoClient = getDynamoClient()
): Promise<void> =>
  client.putItem(
    {
      pk: INGREDIENTS,
      sk: INGREDIENTS,
      ingredients,
    },
    DDB_TABLE_NAME
  )

export const saveIngredients = async (ingredients: string[]): Promise<void> =>
  saveAllIngredients(ingredients, getDynamoClient())

export const getIngredients = async (client: DynamoClient = getDynamoClient()): Promise<string[]> =>
  client
    .getItem({
      TableName: DDB_TABLE_NAME,
      Key: {
        pk: INGREDIENTS,
        sk: INGREDIENTS,
      } as any,
    })
    .then((res) => pathOr<string[]>([], ['Items', 'ingredients'], res))

export const saveIngredient = async (ingredient: string): Promise<void> => {
  const client = getDynamoClient()
  const ingredients = await getIngredients(client)
  const updatedIngredients = Array.from(new Set([...ingredients, ingredient]))

  return saveAllIngredients(updatedIngredients, client)
}
