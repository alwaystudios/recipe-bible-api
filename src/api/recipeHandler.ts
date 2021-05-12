/* eslint-disable */

// todo: re-enable linting
import { ALBResult } from 'aws-lambda'
import createHttpError from 'http-errors'
import { HandlerProps } from './types'
import { getRecipes, saveRecipes } from '../domain/recipeService'
import { pathOr } from 'ramda'

export const recipeHandler = async ({
  httpMethod,
  subsegments,
  body,
  queryStringParameters,
}: HandlerProps): Promise<ALBResult> => {
  switch (httpMethod) {
    case 'POST':
      if (subsegments.length === 0) {
        await saveRecipes(pathOr([], ['recipes'], JSON.parse(body || '{}')))

        return {
          statusCode: 202,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            status: 'import recipes accepted',
          }),
        }
      }

    case 'GET':
      const _published = pathOr('true', ['published'], queryStringParameters)
      const _focused = pathOr('all', ['focused'], queryStringParameters)

      if (subsegments.length) {
        break
      }

      const data = await getRecipes({
        published: _published === 'true',
        focused: _focused === 'all' ? 'all' : _focused === 'true',
      })

      return {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          status: 'ok',
          data,
        }),
      }
  }

  throw createHttpError(404)
}
