import middy from '@middy/core'
import { ALBEvent, ALBResult } from 'aws-lambda'
import _ from 'lodash'

const httpErrorHandler = (): middy.MiddlewareObject<ALBEvent, ALBResult> => {
  return {
    onError: (handler: middy.HandlerLambda, next: middy.NextFunction) => {
      const { error } = handler

      const statusCode = _.get(error, ['statusCode'], 500)

      // eslint-disable-next-line functional/no-let
      let errors = [{ message: 'Something went wrong' }]
      if (statusCode < 500) {
        errors = Array.isArray(error) ? error : [error]
      }

      Object.assign(handler, {
        response: {
          statusCode,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ status: 'error', errors }),
        },
      })

      return next()
    },
  }
}

export { httpErrorHandler }
