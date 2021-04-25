import { ALBResult } from 'aws-lambda'
import createHttpError from 'http-errors'
import { HandlerProps } from './types'
import { getRecipes } from '../domain/recipeService'
import _ from 'lodash'

export const recipeHandler = async ({
	httpMethod,
	subsegments,
	queryStringParameters,
}: HandlerProps): Promise<ALBResult> => {
	switch (httpMethod) {
		case 'GET':
			const _published = _.get(queryStringParameters, ['published'], 'true')
			const _focused = _.get(queryStringParameters, ['focused'], 'all')

			if (subsegments.length) {
				break
			}

			const data = await getRecipes({
				published: _published === 'true',
				focused: _focused === 'all' ? 'all' : _focused === 'true',
			})

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
