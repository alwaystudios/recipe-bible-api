import { DDB_TABLE_NAME } from '../constants'
import { getDynamoClient } from '../clients/getClients'
import { QueryInput, QueryOutput } from 'aws-sdk/clients/dynamodb'
import { pathOr } from 'ramda'
import { Recipe } from '@alwaystudios/recipe-bible-sdk'

export const saveRecipe = async (recipe: Recipe): Promise<void> => {
  if (!recipe.title) {
    throw new Error('Missing title')
  }

  await getDynamoClient().putItem(
    {
      pk: 'recipe',
      sk: recipe.title,
      recipe,
    },
    DDB_TABLE_NAME
  )
}

export const saveRecipes = async (recipes: Recipe[]): Promise<void[]> =>
  Promise.all(recipes.map(saveRecipe))

export const getRecipeQuery = {
  TableName: DDB_TABLE_NAME,
  KeyConditionExpression: '#pk = :pk',
  ExpressionAttributeNames: {
    '#pk': 'pk',
  },
  ExpressionAttributeValues: {
    ':pk': 'recipe',
  },
} as QueryInput

type GetRecipeParams = {
  published: boolean
  focused: boolean | 'all'
}

const fromRecipesQuery = (
  res: QueryOutput,
  published: boolean,
  focused: boolean | 'all'
): Recipe[] => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recipes: any[] = pathOr([], ['Items'], res).map((item) =>
    pathOr(undefined, ['recipe'], item)
  )

  return recipes
    .filter((recipe) => recipe.metadata.published === published)
    .filter((recipe) => (focused === 'all' ? true : recipe.metadata.focused === focused))
}

export const getRecipes = async ({ published, focused }: GetRecipeParams): Promise<Recipe[]> =>
  getDynamoClient()
    .query(getRecipeQuery)
    .then((res) => fromRecipesQuery(res, published, focused))

export const getRecipe = async (slug: string): Promise<Recipe | undefined> =>
  getDynamoClient()
    .getItem({
      TableName: DDB_TABLE_NAME,
      Key: {
        pk: 'recipe',
        sk: slug,
      } as any,
    })
    .then((res) => pathOr<Recipe | undefined>(undefined, ['Item', 'recipe'], res))
