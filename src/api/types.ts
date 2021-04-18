import { ALBEventQueryStringParameters, ALBEventHeaders, ALBResult } from 'aws-lambda'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type HandlerProps = {
	awsRequestId: string
	httpMethod: HttpMethod
	subsegments: string[]
	body: string | null
	queryStringParameters?: ALBEventQueryStringParameters
	headers?: ALBEventHeaders
}

export type Handler = (props: HandlerProps) => Promise<ALBResult>
