import middy from '@middy/core'
import { httpErrorHandler } from '../middleware/httpErrorHandler'
import { ALBEvent, ALBResult, Context } from 'aws-lambda'
import { createRouter } from './routerFactory'
import { recipeHandler as recipes } from './recipeHandler'

const handler = async (event: ALBEvent, { awsRequestId }: Context): Promise<ALBResult> =>
  createRouter({ recipes }).executeHandler(event, awsRequestId)

export const endpoint = middy(handler).use(httpErrorHandler())
