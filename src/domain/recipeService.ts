import { DDB_TABLE_NAME } from '../constants'
import { getDynamoClient } from '../clients/getClients'
import { QueryInput, QueryOutput } from 'aws-sdk/clients/dynamodb'
import { Recipe } from './types'
import _ from 'lodash'

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

const fromRecipesQuery = (res: QueryOutput, published: boolean, focused: boolean | 'all'): Recipe[] => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const recipes: any[] = _.get(res, ['Items'], [])

	return recipes
		.map(
			({
				sk,
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
			}) => ({
				title: sk,
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
		.filter((recipe) => recipe.metadata.published === published)
		.filter((recipe) => (focused === 'all' ? true : recipe.metadata.focused === focused))
}

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

export const getRecipes = async ({ published, focused }: GetRecipeParams): Promise<Recipe[]> =>
	getDynamoClient()
		.query(getRecipeQuery)
		.then((res) => fromRecipesQuery(res, published, focused))
