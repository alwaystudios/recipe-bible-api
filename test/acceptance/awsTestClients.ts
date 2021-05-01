/* eslint-disable @typescript-eslint/no-explicit-any */

import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createDynamoClient } from '../../src/clients/dynamoClient'
import { LOCAL_AWS_CONFIG } from '../../src/constants'

export const testDynamoClient = createDynamoClient(new DocumentClient(LOCAL_AWS_CONFIG))
