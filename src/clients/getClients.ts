import { createDynamoClient, DynamoClient } from './dynamoClient'

const dynamoInstance = Object.freeze(createDynamoClient())

export const getDynamoClient = (): DynamoClient => dynamoInstance
