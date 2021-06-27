/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires */

import fs from 'fs'
import { parse } from 'path'
import { createS3Client } from '../src/clients/s3Client'
import { S3 } from 'aws-sdk'
const { region, accessKeyId, secretAccessKey } = require('../secrets.json')

const BASE_FOLDER = './migrate'

export const testS3Client = createS3Client(new S3({ region, accessKeyId, secretAccessKey }))

const migrateAsset = async (key: string) => {
  if (!key) {
    return
  }

  if (key.endsWith('/')) {
    return
  }

  const { dir, base } = parse(key)
  const fullpath = `${BASE_FOLDER}/${dir}`

  if (!fs.existsSync(fullpath)) {
    fs.mkdirSync(fullpath, { recursive: true })
  }

  const asset = await testS3Client.getObject(key)
  const filename = `${fullpath}/${base}`
  try {
    fs.writeFileSync(filename, asset.Body as string, {
      flag: 'wx',
    })
  } catch (error) {
    if (!error.message.includes('file already exists')) {
      console.error(`Failed to save asset: ${key}`, error)
    }
  }
}

const migrateFolder = async (dir: string) => {
  const contents = await testS3Client.ls(dir)

  for (const asset of contents) {
    await migrateAsset(asset)
  }
}

const migrate = async () => {
  await migrateFolder('ingredients')
  await migrateFolder('recipes')
}

migrate()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.log(err)
  })
