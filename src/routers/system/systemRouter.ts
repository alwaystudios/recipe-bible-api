import { Router } from 'express'
import { Pool } from 'pg'
import { middlewareError } from '../../server/errorHandler'
import { getSystemStatus } from './systemRepository'

export const createSystemRouter = (connectionPool: Pool): Router => {
  const router = Router()

  router.get('/system', async (_, res, next) => {
    await getSystemStatus(connectionPool)
      .then((systemStatus) => res.send(systemStatus))
      .catch(middlewareError(next, `Unable to get status`))
  })

  return router
}
