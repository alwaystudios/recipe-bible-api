import { NextFunction } from 'express'

export const middlewareError = (next: NextFunction, message: string) => (error: Error) => {
  // eslint-disable-next-line functional/immutable-data
  return next(Object.assign(error, { message: `${message} ${error.message}` }))
}
