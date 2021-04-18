import { DDB_TABLE_NAME } from '../constants'
import { getDynamoClient } from '../clients/getClients'
import { QueryInput, QueryOutput } from 'aws-sdk/clients/dynamodb'
import { Metadata, Recipe } from './types'
import _ from 'lodash'

export const saveRecipeMetadata = async (title: string, metadata: Metadata): Promise<void> => {
	await getDynamoClient().updateItem({
		TableName: DDB_TABLE_NAME,
		Key: {
			pk: 'reipce',
			sk: title,
		},
		UpdateExpression: 'set metadata = :metadata',
		ExpressionAttributeValues: {
			':metadata': metadata,
		},
	})
}

export const saveRecipe = async ({
	title,
	steps,
	story,
	imgSrc,
	metadata,
	servings,
	nutrition,
	categories,
	cookingTime,
	prepTime,
	youWillNeed,
	ingredients,
	ratings,
}: Recipe): Promise<void> =>
	getDynamoClient().putItem(
		{
			pk: 'recipe',
			sk: title,
			metadata,
			imgSrc,
			story,
			steps,
			ingredients,
			servings,
			nutrition,
			categories,
			cookingTime,
			prepTime,
			youWillNeed,
			ratings,
		},
		DDB_TABLE_NAME,
	)

const fromRecipesQuery = (res: QueryOutput): Recipe[] => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const recipes: any[] = _.get(res, ['Items'], [])

	return recipes.map(
		({
			title,
			steps,
			story,
			imgSrc,
			metadata,
			servings,
			nutrition,
			categories,
			cookingTime,
			prepTime,
			youWillNeed,
			ingredients,
			ratings,
		}: Recipe) => ({
			title,
			steps,
			story,
			imgSrc,
			metadata,
			servings,
			nutrition,
			categories,
			cookingTime,
			prepTime,
			youWillNeed,
			ingredients,
			ratings,
		}),
	)
}

export const getRecipes = async (): Promise<Recipe[]> =>
	getDynamoClient()
		.query({
			TableName: DDB_TABLE_NAME,
			KeyConditionExpression: '#pk = :pk',
			ExpressionAttributeNames: {
				'#pk': 'pk',
			},
			ExpressionAttributeValues: {
				':pk': 'recipe',
			},
		} as QueryInput)
		.then((res) => fromRecipesQuery(res))
