import { uploadImage } from './contentService'
import * as getClientsModule from '../clients/getClients'
import { createS3MockClient } from '../../test/factories/testAwsMockClients'
import * as sharpClient from '../clients/sharpClient'

const resizeImage = jest.spyOn(sharpClient, 'resizeImage')

const objectExists = jest.fn()
const putObject = jest.fn()
jest
  .spyOn(getClientsModule, 'getS3Client')
  .mockImplementation(() => createS3MockClient({ objectExists, putObject }))

const folder = 'folder'
const filename = 'filename.png'
const data = Buffer.from('some data')
const type = 'png'

describe('content service', () => {
  it('uploads an ingredient image', async () => {
    const resizedImage = Buffer.from(data)
    objectExists.mockResolvedValueOnce(false)
    resizeImage.mockResolvedValueOnce(resizedImage)
    putObject.mockResolvedValueOnce(undefined)

    await uploadImage({
      filename,
      folder,
      data,
      type,
      assetType: 'ingredient',
    })

    expect(putObject).toHaveBeenCalledTimes(1)
    expect(putObject).toHaveBeenCalledWith(`${folder}/${filename}`, resizedImage, type)
    expect(resizeImage).toHaveBeenCalledTimes(1)
    expect(resizeImage).toHaveBeenCalledWith(data, 500)
    expect(objectExists).toHaveBeenCalledTimes(1)
    expect(objectExists).toHaveBeenCalledWith(`${folder}/${filename}`)
  })

  it('uploads a recipe image', async () => {
    const resizedImage = Buffer.from(data)
    objectExists.mockResolvedValueOnce(false)
    resizeImage.mockResolvedValueOnce(resizedImage)
    putObject.mockResolvedValueOnce(undefined)

    await uploadImage({
      filename,
      folder,
      data,
      type,
      assetType: 'recipe',
    })

    expect(putObject).toHaveBeenCalledTimes(1)
    expect(putObject).toHaveBeenCalledWith(`${folder}/${filename}`, resizedImage, type)
    expect(resizeImage).toHaveBeenCalledTimes(1)
    expect(resizeImage).toHaveBeenCalledWith(data, 1000)
    expect(objectExists).toHaveBeenCalledTimes(1)
    expect(objectExists).toHaveBeenCalledWith(`${folder}/${filename}`)
  })

  it('throws an error if the object already exists and overwright is false', async () => {
    objectExists.mockResolvedValueOnce(true)

    await expect(
      uploadImage({
        filename,
        folder,
        data,
        type,
        assetType: 'recipe',
        overwrite: false,
      })
    ).rejects.toEqual(new Error('S3 object already exists'))

    expect(putObject).not.toHaveBeenCalled()
    expect(resizeImage).not.toHaveBeenCalled()
    expect(objectExists).toHaveBeenCalledTimes(1)
    expect(objectExists).toHaveBeenCalledWith(`${folder}/${filename}`)
  })

  it('overwrights an ingredient image', async () => {
    const resizedImage = Buffer.from(data)
    objectExists.mockResolvedValueOnce(true)
    resizeImage.mockResolvedValueOnce(resizedImage)
    putObject.mockResolvedValueOnce(undefined)

    await uploadImage({
      filename,
      folder,
      data,
      type,
      assetType: 'ingredient',
    })

    expect(putObject).toHaveBeenCalledTimes(1)
    expect(putObject).toHaveBeenCalledWith(`${folder}/${filename}`, resizedImage, type)
    expect(resizeImage).toHaveBeenCalledTimes(1)
    expect(resizeImage).toHaveBeenCalledWith(data, 500)
    expect(objectExists).toHaveBeenCalledTimes(1)
    expect(objectExists).toHaveBeenCalledWith(`${folder}/${filename}`)
  })
})
