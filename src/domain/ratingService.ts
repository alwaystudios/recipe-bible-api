import { kebabify, RecipeRating } from '@alwaystudios/recipe-bible-sdk'
import { getDynamoClient } from '../clients/getClients'
import { v4 as uuidv4 } from 'uuid'
import { DDB_TABLE_NAME } from '../constants'
import { QueryInput } from 'aws-sdk/clients/dynamodb'
import { pathOr } from 'ramda'
import { getRecipe } from './recipeService'

const pk = 'recipe-rating'

export const rateRecipe = async (title: string, rating: number): Promise<void> => {
  if (!title || !title.trim()) {
    throw new Error('Failed to rate recipe: missing title')
  }

  const slug = kebabify(title)
  const client = getDynamoClient()
  const id = uuidv4()
  const sk = `${slug}#${id}`

  const recipe = await getRecipe(slug)

  if (!recipe) {
    throw new Error('Failed to rate recipe: recipe not found')
  }

  await client.putItem(
    {
      pk,
      sk,
      rating,
    },
    DDB_TABLE_NAME
  )
}

export const getRecipeRatings = async (title: string): Promise<number[]> =>
  getDynamoClient()
    .query({
      TableName: DDB_TABLE_NAME,
      KeyConditionExpression: '#pk = :pk and begins_with(#sk, :sk)',
      ExpressionAttributeNames: {
        '#pk': 'pk',
        '#sk': 'sk',
      },
      ExpressionAttributeValues: {
        ':pk': pk,
        ':sk': `${kebabify(title)}#`,
      },
    } as QueryInput)
    .then((res: any) => pathOr([], ['Items'], res).map(({ rating }) => rating))

export const getAllRecipeRatings = async (): Promise<RecipeRating[]> =>
  getDynamoClient()
    .query({
      TableName: DDB_TABLE_NAME,
      KeyConditionExpression: '#pk = :pk',
      ExpressionAttributeNames: {
        '#pk': 'pk',
      },
      ExpressionAttributeValues: {
        ':pk': pk,
      },
    } as QueryInput)
    .then((res: any) =>
      pathOr([], ['Items'], res).map(({ rating, sk }: { rating: number; sk: string }) => ({
        rating,
        title: sk.split('#')[0],
      }))
    )
