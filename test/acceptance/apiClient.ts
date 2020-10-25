import request from 'superagent'
import { Recipe } from '../../src/recipe/recipetypes'
import * as secrets from './apiSecrets.json'

const BASE_URL = 'http://localhost:3000/api/v2'

export const healthCheck = async (): Promise<JSON> =>
  request.get(`${BASE_URL}/healthcheck`).then(({ body }) => {
    return body as JSON
  })

export const getRecipes = async (): Promise<any> =>
  request.get(`${BASE_URL}/recipe`).then(({ status, body }) => ({ status, body }))

export const postCreateRecipe = async (accessToken: string, recipe: Recipe): Promise<any> =>
  request
    .post(`${BASE_URL}/recipe`)
    .send(recipe)
    .set('authorization', `Bearer ${accessToken}`)
    .then(({ status, body }) => ({ status, body }))

export const login = async (): Promise<string> =>
  request
    .post(`https://dev-27x9tbv3.eu.auth0.com/oauth/token`)
    .set('content-type', 'application/json')
    .send(secrets)
    .then(({ body: { access_token } }) => access_token)
