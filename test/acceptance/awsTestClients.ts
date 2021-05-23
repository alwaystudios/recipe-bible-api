/* eslint-disable @typescript-eslint/no-explicit-any */

import { S3 } from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createDynamoClient } from '../../src/clients/dynamoClient'
import { createS3Client } from '../../src/clients/s3Client'
import { LOCAL_AWS_CONFIG } from '../../src/constants'

export const testDynamoClient = createDynamoClient(new DocumentClient(LOCAL_AWS_CONFIG))
export const testS3Client = createS3Client(new S3(LOCAL_AWS_CONFIG))
