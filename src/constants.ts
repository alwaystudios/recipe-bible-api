export const { IS_OFFLINE, ENV_RECIPE_API_BASE_URL, ENV_TABLE_NAME, ENV_AUTH_SERVICE_BASE_URL } = process.env

export const BASE_URL = 'http://localhost:21111'

export const AUTH_SERVICE_URL = ENV_AUTH_SERVICE_BASE_URL || 'http://todo'
export const DDB_TABLE_NAME = ENV_TABLE_NAME || 'ddb-local-recipe-bible'
