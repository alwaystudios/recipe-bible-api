export const { IS_OFFLINE } = process.env
export const JWKSURI = 'https://dev-27x9tbv3.eu.auth0.com/.well-known/jwks.json'
export const KID = 'LyBJKVRB7d0fsZH5jSbLa'
export const DDB_TABLE_NAME = 'recipe-bible'
export const LOCAL_BASE_URL = 'http://localhost:21111'
export const LOCAL_AWS_CONFIG = {
  region: 'us-east-1',
  accessKeyId: 'root',
  secretAccessKey: 'root',
  endpoint: 'http://localhost:4566',
}
export const BUCKET = 'recipe-bible-content'

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
}
