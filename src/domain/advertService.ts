import { Advert } from '@alwaystudios/recipe-bible-sdk'
import { pathOr } from 'ramda'
import { DynamoClient } from '../clients/dynamoClient'
import { getDynamoClient } from '../clients/getClients'
import { DDB_TABLE_NAME } from '../constants'

const ADVERTS = 'adverts'

export const getAdverts = async (client: DynamoClient = getDynamoClient()): Promise<Advert[]> =>
  client
    .getItem({
      TableName: DDB_TABLE_NAME,
      Key: {
        pk: ADVERTS,
        sk: ADVERTS,
      } as any,
    })
    .then((res) => pathOr<Advert[]>([], ['Item', 'adverts'], res))

export const saveAdvert = async (advert: Advert): Promise<void> => {
  const client = getDynamoClient()
  const adverts = await getAdverts(client)
  const updatedAdverts = adverts.some(({ src }) => src === advert.src)
    ? adverts
    : [...adverts, advert]

  await client.putItem(
    {
      pk: ADVERTS,
      sk: ADVERTS,
      adverts: updatedAdverts,
    },
    DDB_TABLE_NAME
  )
}
