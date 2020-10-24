import request from 'superagent'

// todo: use config and a baseUrl

export const healthCheck = async () =>
  request.get(`http://localhost:3000/healthcheck`).then(({ body }) => {
    return body
  })
