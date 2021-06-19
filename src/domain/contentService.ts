import { getS3Client } from '../clients/getClients'
import { resizeImage } from '../clients/sharpClient'

export type AssetType = 'recipe' | 'ingredient' | 'step'

type UploadImage = {
  filename: string
  folder: string
  data: string | Buffer
  type: string
  assetType: AssetType
}

export const uploadImage = async ({
  filename,
  folder,
  data,
  type,
  assetType,
}: UploadImage): Promise<void> => {
  const client = getS3Client()

  const location = `${folder}/${filename}`
  const exists = await client.objectExists(location)

  if (exists) {
    throw new Error('S3 object already exists')
  }

  const width = assetType === 'recipe' ? 1000 : 500
  const resizedImage = await resizeImage(data, width)

  await client.putObject(location, resizedImage, type)
}
