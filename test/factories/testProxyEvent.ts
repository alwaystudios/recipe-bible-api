import { ALBEvent } from 'aws-lambda'

const createEventMock = (albEvent: Partial<ALBEvent>): ALBEvent => ({
	httpMethod: '',
	path: '',
	multiValueHeaders: {},
	isBase64Encoded: false,
	body: '',
	headers: {},
	multiValueQueryStringParameters: {},
	queryStringParameters: {},
	requestContext: {
		elb: {
			targetGroupArn: '',
		},
	},
	...albEvent,
})

const createALBEventMock = (albEvent: Partial<ALBEvent>): ALBEvent => createEventMock(albEvent)

export { createALBEventMock }
