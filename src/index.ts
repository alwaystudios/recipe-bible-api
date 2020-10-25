import { Pool } from 'pg'
import { createApp } from './server/createApp'
import config from './infra/config'
import { createLogger } from './infra/logger'

const log = createLogger(config)

const pgConfig = {
  min: 10,
  max: 20,
  host: config.get('db.host'),
  port: config.get('db.port'),
  database: config.get('db.database'),
  user: config.get('db.username'),
  password: config.get('db.password'),
  ssl: false,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 60000,
}

const connectionPool = new Pool(pgConfig)
connectionPool.on('error', (err) => {
  log.error('An idle PG client has experienced an error', err.stack)
})

Promise.resolve()
  .then(() => {
    const { startApp } = createApp(config, log, connectionPool)
    return startApp
  })
  .then((startApp) => startApp())
  .catch((error) => {
    log.error('Service crashed with error: ', error)
  })
