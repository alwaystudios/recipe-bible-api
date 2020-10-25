import express from 'express'
import { AddressInfo } from 'net'
import { clone } from 'ramda'
import { Logger } from 'winston'
import { Config } from './infra/config'
import { createRouter } from './routes'

interface App {
  app: express.Express
  startApp: () => Promise<void>
}

export const createApp = (config: Config, log: Logger): App => {
  const app = express()

  const clonedConfig = clone(config)
  clonedConfig.set('db.username', '***')
  clonedConfig.set('db.password', '***')
  log.info(`config: ${clonedConfig.toString()}`)

  app.use('/api/v2', createRouter({ log }))

  app.all('*', (_, res) => {
    res.sendStatus(404)
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { originalUrl, path } = req
    log.error(`Service error, url: ${originalUrl} path: ${path} `, err)

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
