import { Express } from 'express'
import { createApp } from '../src/createApp'
import { Logger } from 'winston'
import { Config } from '../src/infra/config'

export const testApp = (config: Config, log: Logger): Express => {
  return createApp(config, log).app
}
