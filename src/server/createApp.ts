import express from 'express'
import { UnauthorizedError } from 'express-jwt'
import { AddressInfo } from 'net'
import { Pool } from 'pg'
import { Logger } from 'winston'
import { Config } from '../infra/config'
import { createApiRouter } from './createApiRouter'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'

interface App {
  app: express.Express
  startApp: () => Promise<void>
}

export const createApp = (config: Config, log: Logger, connectionPool: Pool): App => {
  const app = express()
  log.info(`config: ${config.toString()}`)

  app.use(cookieParser())
  app.use(cors())
  app.use(helmet())

  app.use('/api/v2', createApiRouter(log, connectionPool))

  app.all('*', (_, res) => {
    res.sendStatus(404)
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { originalUrl, method } = req
    log.error(`Service error, url: ${method} ${originalUrl}`, err)

    if (err instanceof UnauthorizedError) {
      res.sendStatus(401)
      return
    }

    res.status(500)
    res.send({
      error: err.message,
    })
  })

  const startApp = async (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      try {
        const server = app.listen(config.get('port'), () => {
          const address = server.address() as AddressInfo
          log.info(`Started on port ${address.port}`)
          return resolve()
        })
        server.once('error', (err) => {
          return reject(err)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  return { app, startApp }
}
