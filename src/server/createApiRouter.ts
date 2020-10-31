import { json, Router, urlencoded } from 'express'
import { Pool } from 'pg'
import { Logger } from 'winston'
import { createRecipeRouter } from '../recipe/recipeRouter'
import { createSystemRouter } from '../system/systemRouter'

export const createApiRouter = (log: Logger, connectionPool: Pool): Router => {
  const router = Router()

  log.debug('Creating API routes')
  router.use(json({ limit: '100mb' }))
  router.use(urlencoded({ extended: true }))

  router.get('/healthcheck', (_, res) => res.send({ status: 'healthy' }))
  router.use(createRecipeRouter(log, connectionPool))
  router.use(createSystemRouter(connectionPool))

  return router
}
