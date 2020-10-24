import { createLogger as createWinstonLogger, transports, format, Logger } from 'winston'
import config from './config'

const level = config.get('logLevel')

const createLogger = (): Logger => {
  return createWinstonLogger({
    level: `${level}`,
    transports: [new transports.Console()],
    format: format.combine(format.timestamp(), format.colorize(), format.simple()),
  })
}

export const log = createLogger()
