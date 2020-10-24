import cookieParser from 'cookie-parser'
import express from 'express'
import { AddressInfo } from 'net'
import config from './infra/config'
import { log } from './infra/logger'

const app = express()

Promise.resolve()
  .then(() => {
    log.debug(config)
    app.use(cookieParser())

    app.get('/healthcheck', (_, res) => res.send({ status: 'healthy' }))

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

    startApp()
  })
  .catch((error) => {
    log.error('Service crashed with error', error)
  })
