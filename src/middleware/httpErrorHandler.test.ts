import createHttpError from 'http-errors'
import { Context, Callback } from 'aws-lambda'
import middy from '@middy/core'
import { httpErrorHandler } from './httpErrorHandler'

describe('error handler onError', () => {
	it('should log an error if error status code >= 500', () => {
		const error = createHttpError(500, 'Something went wrong')

		const emptyHandler: middy.HandlerLambda = {
			event: {},
			context: ({} as unknown) as Context,
			response: {},
			error: error,
			callback: (null as unknown) as Callback,
		}

		const next = jest.fn()

		const { onError } = httpErrorHandler()
		onError && onError(emptyHandler, next)
	})

	it('should log a warning if error status code < 500', () => {
		const error = createHttpError(400, 'Something went bad')

		const emptyHandler: middy.HandlerLambda = {
			event: {},
			context: ({} as unknown) as Context,
			response: {},
			error: error,
			callback: (null as unknown) as Callback,
		}

		const next = jest.fn()

		const { onError } = httpErrorHandler()
		onError && onError(emptyHandler, next)
	})

	it('should use a generic message for status code >= 500', () => {
		const emptyHandler: middy.HandlerLambda = {
			event: {},
			context: ({} as unknown) as Context,
			response: {},
			error: createHttpError(500, 'Do not send that'),
			callback: (null as unknown) as Callback,
		}

		const next = jest.fn()

		const { onError } = httpErrorHandler()
		onError && onError(emptyHandler, next)

		expect(emptyHandler.response).toEqual({
			body: JSON.stringify({
				status: 'error',
				errors: [{ message: 'Something went wrong' }],
			}),
			headers: { 'content-type': 'application/json' },
			statusCode: 500,
		})
	})

	it('should return response with statusCode provided and error message', () => {
		const emptyHandler: middy.HandlerLambda = {
			event: {},
			context: ({} as unknown) as Context,
			response: {},
			error: createHttpError(400, 'Something went wrong'),
			callback: (null as unknown) as Callback,
		}

		const next = jest.fn()

		const { onError } = httpErrorHandler()
		onError && onError(emptyHandler, next)

		expect(emptyHandler.response).toEqual({
			body: JSON.stringify({
				status: 'error',
				errors: [{ message: 'Something went wrong' }],
			}),
			headers: { 'content-type': 'application/json' },
			statusCode: 400,
		})
	})

	it('should return response with status code 500 when no statusCode provided', () => {
		const emptyHandler: middy.HandlerLambda = {
			event: {},
			context: ({} as unknown) as Context,
			response: {},
			error: { message: 'this is a message' } as Error,
			callback: (null as unknown) as Callback,
		}

		const next = jest.fn()

		const { onError } = httpErrorHandler()
		onError && onError(emptyHandler, next)

		expect(emptyHandler.response).toEqual({
			body: JSON.stringify({
				status: 'error',
				errors: [{ message: 'Something went wrong' }],
			}),
			headers: { 'content-type': 'application/json' },
			statusCode: 500,
		})
	})
})