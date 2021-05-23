import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { S3 } from 'aws-sdk'
import { IS_OFFLINE, LOCAL_AWS_CONFIG } from '../constants'
import { createDynamoClient, DynamoClient } from './dynamoClient'
import { createS3Client, S3Client } from './s3Client'

const dynamoInstance = Object.freeze(
  createDynamoClient(new DocumentClient(IS_OFFLINE ? LOCAL_AWS_CONFIG : undefined))
)
const s3Instance = Object.freeze(createS3Client(new S3(IS_OFFLINE ? LOCAL_AWS_CONFIG : undefined)))

export const getDynamoClient = (): DynamoClient => dynamoInstance
export const getS3Client = (): S3Client => s3Instance
