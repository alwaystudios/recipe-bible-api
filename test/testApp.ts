import { Express } from 'express'
import { createApp } from '../src/server/createApp'
import { Config } from '../src/infra/config'
import { testLog } from './testLog'
import { testConnectionPool } from '@alwaystudios/as-pg'

export const testApp = (
  config: Config,
  log = testLog(),
  connectionPool = testConnectionPool(),
): Express => {
  return createApp(config, log, connectionPool).app
}
