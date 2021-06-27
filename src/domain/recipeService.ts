import { DDB_TABLE_NAME } from '../constants'
import { getDynamoClient, getS3Client } from '../clients/getClients'
import { QueryInput, QueryOutput } from 'aws-sdk/clients/dynamodb'
import { pathOr } from 'ramda'
import { kebabify, Recipe } from '@alwaystudios/recipe-bible-sdk'

export const createRecipe = async (title: string): Promise<void> => {
  if (!title) {
    throw new Error('Failed to create recipe: missing title')
  }

  const slug = kebabify(title)
  const client = getDynamoClient()

  const existing = await getRecipe(slug)

  if (existing) {
    throw new Error('Failed to create recipe: existing recipe')
  }

  await client.putItem(
    {
      pk: 'recipe',
      sk: slug,
      recipe: { title: slug },
    },
    DDB_TABLE_NAME
  )
}

export const saveRecipe = async (recipe: Recipe): Promise<void> => {
  if (!recipe.title) {
    throw new Error('Failed to save recipe: missing title')
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
  published: BooleanOrAll
  focused: BooleanOrAll
}

const fromRecipesQuery = (
  res: QueryOutput,
  published: BooleanOrAll,
  focused: BooleanOrAll
): Recipe[] => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recipes: any[] = pathOr([], ['Items'], res).map((item) =>
    pathOr(undefined, ['recipe'], item)
  )

  return recipes
    .filter((recipe) =>
      published === 'all' ? true : pathOr(false, ['metadata', 'published'], recipe) === published
    )
    .filter((recipe) =>
      focused === 'all' ? true : pathOr(false, ['metadata', 'focused'], recipe) === focused
    )
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

export const deleteRecipe = async (title: string): Promise<void> => {
  await getDynamoClient().deleteItem({
    TableName: DDB_TABLE_NAME,
    Key: {
      pk: 'recipe',
      sk: title,
    } as any,
  })

  await getS3Client().rmdir(`recipes/${title}`)
}
