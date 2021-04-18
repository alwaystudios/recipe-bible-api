import { ALBEvent } from 'aws-lambda'
import createHttpError from 'http-errors'
import { Handler, HttpMethod } from './types'
import { pathParser } from '../utils/pathParser'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createRouter = (handlers: Record<string, Handler>) => {
	const executeHandler = async (event: ALBEvent, awsRequestId: string) => {
		const { path, httpMethod, queryStringParameters, body, headers } = event
		const { handlerName, subsegments } = pathParser(path)
		const handler = handlers[handlerName]

		if (!handler) {
			throw createHttpError(404)
		}

		return handler({
			httpMethod: httpMethod as HttpMethod,
			subsegments,
			body,
			queryStringParameters,
			headers,
			awsRequestId,
		})
	}

	return {
		executeHandler,
	}
}
