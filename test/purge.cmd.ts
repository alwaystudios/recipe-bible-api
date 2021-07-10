import { DDB_TABLE_NAME } from '../src/constants'
import { testDynamoClient, testS3Client } from './acceptance/awsTestClients'

const purge = async () =>
  Promise.all([
    testS3Client.rmdir('recipes'),
    testS3Client.rmdir('ingredients'),
    testDynamoClient.truncateTable(DDB_TABLE_NAME, 'pk', 'sk'),
  ])

purge()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err)
    process.exit(1)
  })
