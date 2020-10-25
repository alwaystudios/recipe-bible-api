import cookieParser from 'cookie-parser'
import { json, Router, urlencoded } from 'express'
import { Logger } from 'winston'

export type RouterProps = {
  log: Logger
}

export const createRouter = ({ log }: RouterProps): Router => {
  const router = Router()

  log.debug('Creating API routes')

  router.use(cookieParser())
  router.use(json({ limit: '100mb' }))
  router.use(urlencoded({ extended: true }))

  router.get('/healthcheck', (_, res) => res.send({ status: 'healthy' }))

  return router
}
