import { createDynamoMockClient } from '../../test/factories/testAwsMockClients'
import { testRecipe } from '../../test/factories/testFactories'
import * as getClientsModule from '../clients/getClients'
import { DDB_TABLE_NAME } from '../constants'
import { getRecipeQuery, getRecipes, saveRecipe } from './recipeService'

const putItem = jest.fn()
const query = jest.fn()
jest.spyOn(getClientsModule, 'getDynamoClient').mockImplementation(() => createDynamoMockClient({ putItem, query }))

describe('recipe service', () => {
	afterEach(jest.clearAllMocks)

	test.each<[boolean, boolean | 'all']>([
		[true, 'all'],
		[true, false],
		[false, false],
		[false, 'all'],
	])('gets publihsed recipes with all types of focus', async (published: boolean, focused: boolean | 'all') => {
		const recipes = [
			testRecipe({ metadata: { published, focused: focused === 'all' ? true : focused } }),
			testRecipe({ metadata: { published, focused: focused === 'all' ? true : focused } }),
		]
		query.mockResolvedValueOnce({ Items: recipes.map((recipe) => ({ ...recipe, sk: recipe.title })) })

		const result = await getRecipes({ published, focused })

		expect(result).toMatchObject(recipes)
		expect(query).toHaveBeenCalledTimes(1)
		expect(query).toHaveBeenCalledWith(getRecipeQuery)
	})

	it('save recipe', async () => {
		const recipe = testRecipe()
		putItem.mockResolvedValueOnce(undefined)

		await saveRecipe(recipe)

		expect(putItem).toHaveBeenCalledTimes(1)

		expect(putItem).toHaveBeenCalledWith(
			{
				pk: 'recipe',
				sk: recipe.title,
				metadata: recipe.metadata,
				imgSrc: recipe.imgSrc,
				story: recipe.story,
				steps: recipe.steps,
				ingredients: recipe.ingredients,
				servings: recipe.servings,
				nutrition: recipe.nutrition,
				categories: recipe.categories,
				cookingTime: recipe.cookingTime,
				prepTime: recipe.prepTime,
				youWillNeed: recipe.youWillNeed,
				ratings: recipe.ratings,
			},
			DDB_TABLE_NAME,
		)
	})
})