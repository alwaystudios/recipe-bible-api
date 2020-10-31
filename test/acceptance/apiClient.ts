import { Recipe } from '@alwaystudios/recipe-bible-sdk'
import request from 'superagent'

const BASE_URL = 'http://localhost:3001/api/v2'

export const healthCheck = async (): Promise<JSON> =>
  request.get(`${BASE_URL}/healthcheck`).then(({ body }) => {
    return body as JSON
  })

export const getStatus = async (): Promise<any> =>
  request.get(`${BASE_URL}/system`).then(({ status, body }) => ({ status, body }))

export const getRecipes = async (): Promise<any> =>
  request.get(`${BASE_URL}/recipe`).then(({ status, body }) => ({ status, body }))

export const postCreateRecipe = async (accessToken: string, recipe: Recipe): Promise<any> =>
  request
    .post(`${BASE_URL}/recipe`)
    .send(recipe)
    .set('authorization', `Bearer ${accessToken}`)
    .then(({ status, body }) => ({ status, body }))

export const patchUpdateRecipe = async (accessToken: string, recipe: Recipe): Promise<any> =>
  request
    .patch(`${BASE_URL}/recipe`)
    .send(recipe)
    .set('authorization', `Bearer ${accessToken}`)
    .then(({ status, body }) => ({ status, body }))
