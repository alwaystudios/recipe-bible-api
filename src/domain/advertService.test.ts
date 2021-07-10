import { testAdvert } from '@alwaystudios/recipe-bible-sdk'
import { createDynamoMockClient } from '../../test/factories/testAwsMockClients'
import * as getClientsModule from '../clients/getClients'
import { DDB_TABLE_NAME } from '../constants'
import { deleteAdvert, getAdverts, saveAdvert } from './advertService'

const ADVERTS = 'adverts'
const getItem = jest.fn()
const putItem = jest.fn()
jest
  .spyOn(getClientsModule, 'getDynamoClient')
  .mockImplementation(() => createDynamoMockClient({ putItem, getItem }))

describe('adverts service', () => {
  afterEach(jest.clearAllMocks)

  it('saves a new advert', async () => {
    const advert1 = testAdvert()
    const advert2 = testAdvert()
    const adverts = [advert1, advert2]
    getItem.mockResolvedValueOnce({ Item: { adverts } })
    putItem.mockResolvedValueOnce(undefined)

    const newAdvert = testAdvert()
    await saveAdvert(newAdvert)

    expect(getItem).toHaveBeenCalledTimes(1)
    expect(getItem).toHaveBeenCalledWith({
      TableName: DDB_TABLE_NAME,
      Key: {
        pk: ADVERTS,
        sk: ADVERTS,
      } as any,
    })
    expect(putItem).toHaveBeenCalledTimes(1)
    expect(putItem).toHaveBeenCalledWith(
      {
        pk: ADVERTS,
        sk: ADVERTS,
        adverts: [...adverts, newAdvert],
      },
      DDB_TABLE_NAME
    )
  })

  it('save advert ignores an existing advert', async () => {
    const advert1 = testAdvert()
    const advert2 = testAdvert()
    const adverts = [advert1, advert2]
    getItem.mockResolvedValueOnce({ Item: { adverts } })
    putItem.mockResolvedValueOnce(undefined)

    await saveAdvert(advert1)

    expect(getItem).toHaveBeenCalledTimes(1)
    expect(getItem).toHaveBeenCalledWith({
      TableName: DDB_TABLE_NAME,
      Key: {
        pk: ADVERTS,
        sk: ADVERTS,
      } as any,
    })
    expect(putItem).toHaveBeenCalledTimes(1)
    expect(putItem).toHaveBeenCalledWith(
      {
        pk: ADVERTS,
        sk: ADVERTS,
        adverts,
      },
      DDB_TABLE_NAME
    )
  })

  it('get adverts', async () => {
    const advert1 = testAdvert()
    const advert2 = testAdvert()
    const adverts = [advert1, advert2]
    getItem.mockResolvedValueOnce({ Item: { adverts } })

    const result = await getAdverts()

    expect(result).toEqual(adverts)
    expect(getItem).toHaveBeenCalledTimes(1)
    expect(getItem).toHaveBeenCalledWith({
      TableName: DDB_TABLE_NAME,
      Key: {
        pk: ADVERTS,
        sk: ADVERTS,
      } as any,
    })
  })

  it('deletes an advert', async () => {
    const advert1 = testAdvert()
    const advert2 = testAdvert()
    const adverts = [advert1, advert2]
    getItem.mockResolvedValueOnce({ Item: { adverts } })
    putItem.mockResolvedValueOnce(undefined)

    await deleteAdvert(advert2)

    expect(getItem).toHaveBeenCalledTimes(1)
    expect(getItem).toHaveBeenCalledWith({
      TableName: DDB_TABLE_NAME,
      Key: {
        pk: ADVERTS,
        sk: ADVERTS,
      } as any,
    })
    expect(putItem).toHaveBeenCalledTimes(1)
    expect(putItem).toHaveBeenCalledWith(
      {
        pk: ADVERTS,
        sk: ADVERTS,
        adverts: [advert1],
      },
      DDB_TABLE_NAME
    )
  })
})
