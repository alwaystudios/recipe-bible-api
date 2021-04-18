import { ALBResult } from 'aws-lambda'
import createHttpError from 'http-errors'
import { HandlerProps } from './types'
import { getRecipes } from '../domain/recipeService'

export const recipeHandler = async ({ httpMethod }: HandlerProps): Promise<ALBResult> => {
	switch (httpMethod) {
		case 'GET':
			const data = await getRecipes()

			return {
				statusCode: 200,
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					status: 'ok',
					data,
				}),
			}
	}

	throw createHttpError(404)
}
