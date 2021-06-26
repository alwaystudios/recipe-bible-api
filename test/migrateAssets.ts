/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires */

import fs from 'fs'
import { createS3Client, DIR } from '../src/clients/s3Client'
import { S3 } from 'aws-sdk'
const { region, accessKeyId, secretAccessKey } = require('../secrets.json')

const BASE_FOLDER = './migrate'

export const testS3Client = createS3Client(new S3({ region, accessKeyId, secretAccessKey }))

const migrateAsset = async (key: string) => {
  const asset = await testS3Client.getObject(key)
  const unix_friendly_folder_name = key.replace(`'`, '-')

  console.log(asset)

  if (asset.ContentType === DIR) {
    fs.mkdirSync(`${BASE_FOLDER}/${unix_friendly_folder_name}`, { recursive: true })
    return
  }

  // fs.writeFileSync(`${BASE_FOLDER}/${unix_friendly_folder_name}`, asset.Body as string, {
  //   flag: 'wx',
  // })
}

const migrateFolder = async (dir: string) => {
  const contents = await testS3Client.ls(dir)

  for (const asset of contents) {
    await migrateAsset(asset)
  }
}

const migrate = async () => {
  // await migrateFolder('recipes')
  await migrateFolder('ingredients')
}

migrate()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.log(err)
  })
