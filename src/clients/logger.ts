import { createLogger as createWinstonLogger, transports, format, Logger } from 'winston'

const createLogger = (): Logger =>
  createWinstonLogger({
    level: 'info',
    transports: [new transports.Console()],
    format: format.combine(format.timestamp(), format.colorize(), format.simple()),
  })

const loggerInstance = Object.freeze(createLogger())
export const getLogger = (): Logger => loggerInstance
