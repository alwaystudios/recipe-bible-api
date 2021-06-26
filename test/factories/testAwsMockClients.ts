import { DynamoClient } from '../../src/clients/dynamoClient'
import { S3Client } from '../../src/clients/s3Client'

export const createDynamoMockClient = ({
  putItem = jest.fn(),
  updateItem = jest.fn(),
  getItem = jest.fn(),
  deleteItem = jest.fn(),
  query = jest.fn(),
  truncateTable = jest.fn(),
} = {}): DynamoClient => ({
  putItem,
  updateItem,
  getItem,
  deleteItem,
  query,
  truncateTable,
})

export const createS3MockClient = ({
  getObject = jest.fn(),
  putObject = jest.fn(),
  objectExists = jest.fn(),
  rmdir = jest.fn(),
} = {}): S3Client => ({
  getObject,
  putObject,
  objectExists,
  rmdir,
})
