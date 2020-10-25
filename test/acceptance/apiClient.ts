import request from 'superagent'

const BASE_URL = 'http://localhost:3000/api/v2'

export const healthCheck = async (): Promise<JSON> =>
  request.get(`${BASE_URL}/healthcheck`).then(({ body }) => {
    return body as JSON
  })

export const recipe = async (): Promise<any> =>
  request.get(`${BASE_URL}/recipe`).then(({ status, body }) => ({ status, body }))
