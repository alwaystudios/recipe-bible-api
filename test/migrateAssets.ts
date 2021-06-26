/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires */

import { createS3Client, DIR } from '../src/clients/s3Client'
import { S3 } from 'aws-sdk'
const { region, accessKeyId, secretAccessKey } = require('../secrets.json')

export const testS3Client = createS3Client(new S3({ region, accessKeyId, secretAccessKey }))

const migrateAsset = async (key: string) => {
  const asset = await testS3Client.getObject(key)

  if (asset.ContentType === DIR) {
    console.log(key, asset)
    return
  }
}

const migrateFolder = async (dir: string) => {
  const contents = await testS3Client.ls(dir)

  await Promise.all(contents.map(migrateAsset))
}

const migrate = async () => {
  await migrateFolder('recipes')
  await migrateFolder('ingredients')
}

migrate()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.log(err)
  })
