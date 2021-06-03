import { S3, AWSError } from 'aws-sdk'
import { Readable } from 'stream'
import { BUCKET } from '../constants'

export interface S3Client {
  getObject: (filename: string) => Promise<S3.GetObjectOutput>
  putObject: (
    filename: string,
    data: string | Buffer | Uint8Array | Blob | Readable,
    type: string
  ) => Promise<S3.PutObjectOutput | AWSError>
  objectExists: (filename: string) => Promise<boolean>
}

export const createS3Client = (s3: S3): S3Client => {
  const client = s3

  const getObject = async (filename: string): Promise<S3.GetObjectOutput> =>
    client
      .getObject({
        Bucket: BUCKET,
        Key: filename,
      })
      .promise()

  const putObject = async (
    filename: string,
    data: string | Buffer | Uint8Array | Blob | Readable,
    type: string
  ): Promise<S3.PutObjectOutput | AWSError> =>
    client
      .putObject({
        Bucket: BUCKET,
        Key: filename,
        Body: data,
        ContentType: type,
        ACL: 'public-read',
      })
      .promise()

  const objectExists = async (filename: string): Promise<boolean> =>
    client
      .headObject({
        Bucket: BUCKET,
        Key: filename,
      })
      .promise()
      .then(() => true)
      .catch(({ code }) => {
        if (code === 'NotFound') {
          return false
        }
        throw Error(code)
      })

  return {
    getObject,
    objectExists,
    putObject,
  }
}