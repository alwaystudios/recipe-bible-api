import { datatype } from 'faker'
import { recipeHandler } from './recipeHandler'
import { testRecipe } from '../../test/factories/testFactories'
import { HttpMethod } from './types'
// eslint-disable-next-line import/named
import { NotFound } from 'http-errors'
import * as recipeService from '../domain/recipeService'

const getRecipes = jest.spyOn(recipeService, 'getRecipes')
const saveRecipes = jest.spyOn(recipeService, 'saveRecipes')

describe('recipe handler', () => {
	afterEach(jest.clearAllMocks)

	it('POST /recipes', async () => {
		const recipes = [testRecipe(), testRecipe()]
		saveRecipes.mockResolvedValueOnce([])

		const awsRequestId = datatype.uuid()

		const { headers, statusCode, body } = await recipeHandler({
			httpMethod: 'POST',
			body: JSON.stringify({ recipes }),
			awsRequestId,
			subsegments: [],
		})

		expect(saveRecipes).toHaveBeenCalledTimes(1)
		expect(saveRecipes).toHaveBeenCalledWith(recipes)

		expect(statusCode).toBe(202)
		expect(headers).toEqual({ 'content-type': 'application/json' })

		const { status } = JSON.parse(body || '')
		expect(status).toBe('import recipes accepted')
	})

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

		expect(getRecipes).toHaveBeenCalledTimes(1)
		expect(getRecipes).toHaveBeenCalledWith({ published: true, focused: 'all' })

		expect(statusCode).toBe(200)
		expect(headers).toEqual({ 'content-type': 'application/json' })

		const { status, data } = JSON.parse(body || '')
		expect(status).toBe('ok')
		expect(data).toEqual(recipes)
	})

	test.each([
		['true', 'true'],
		['true', 'false'],
		['false', 'true'],
		['false', 'false'],
		['false', 'all'],
	])('GET /recipes with query string parameters', async (published: string, focused: string) => {
		const recipes = [testRecipe(), testRecipe()]
		getRecipes.mockResolvedValueOnce(recipes)

		const awsRequestId = datatype.uuid()

		const { headers, statusCode, body } = await recipeHandler({
			httpMethod: 'GET',
			body: null,
			awsRequestId,
			subsegments: [],
			queryStringParameters: {
				published,
				focused,
			},
		})

		expect(getRecipes).toHaveBeenCalledTimes(1)
		expect(getRecipes).toHaveBeenCalledWith({
			published: published === 'true',
			focused: focused === 'all' ? 'all' : focused === 'true',
		})

		expect(statusCode).toBe(200)
		expect(headers).toEqual({ 'content-type': 'application/json' })

		const { status, data } = JSON.parse(body || '')
		expect(status).toBe('ok')
		expect(data).toEqual(recipes)
	})

	test.each<[HttpMethod, string[]]>([
		['PATCH', ['/']],
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
