/* eslint-disable @typescript-eslint/no-explicit-any */

import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createDynamoClient } from '../../src/clients/dynamoClient'

const env = {
	region: 'eu-west-1',
	accessKeyId: 'root',
	secretAccessKey: 'root',
	endpoint: 'http://localhost:4566',
}

export const testDynamoClient = createDynamoClient(new DocumentClient(env))
