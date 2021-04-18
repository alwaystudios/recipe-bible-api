import { datatype } from 'faker'
import { recipeHandler } from './recipeHandler'
import { testRecipe } from '../../test/factories/testFactories'
import { HttpMethod } from './types'
// eslint-disable-next-line import/named
import { NotFound } from 'http-errors'
import * as recipeService from '../domain/recipeService'

const getRecipes = jest.spyOn(recipeService, 'getRecipes')

describe('recipe handler', () => {
	afterEach(jest.clearAllMocks)

	it('GET /recipes', async () => {
		const recipes = [testRecipe(), testRecipe()]
		getRecipes.mockResolvedValueOnce(recipes)

		const awsRequestId = datatype.uuid()

		const { headers, statusCode, body } = await recipeHandler({
			httpMethod: 'GET',
			body: null,
			awsRequestId,
			subsegments: [],
		})

		expect(statusCode).toBe(200)
		expect(headers).toEqual({ 'content-type': 'application/json' })

		const { status, data } = JSON.parse(body || '')
		expect(status).toBe('ok')
		expect(data).toEqual(recipes)
	})

	test.each<[HttpMethod, string[]]>([
		['POST', ['/']],
		['GET', ['/1234']],
	])('returns 404 for unknown subsegment / method', async (httpMethod: HttpMethod, subsegments: string[]) => {
		const recipes = [testRecipe(), testRecipe()]
		getRecipes.mockResolvedValueOnce(recipes)

		const awsRequestId = datatype.uuid()

		await expect(
			recipeHandler({
				httpMethod,
				body: null,
				awsRequestId,
				subsegments,
			}),
		).rejects.toEqual(new NotFound())
	})
})
