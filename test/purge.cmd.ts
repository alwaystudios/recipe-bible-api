import { DDB_TABLE_NAME } from '../src/constants'
import { testDynamoClient } from './acceptance/awsTestClients'

const purge = () => testDynamoClient.truncateTable(DDB_TABLE_NAME, 'pk', 'sk')

purge()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err)
    process.exit(1)
  })
