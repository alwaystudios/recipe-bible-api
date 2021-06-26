import { wrap } from 'lambda-wrapper'
import * as deleteRecipeApi from './deleteRecipe'
import * as recipeService from '../domain/recipeService'
import { createAPIGatewayEventMock } from '../../test/factories/proxyEventMock'
import { random } from 'faker'
import { CORS_HEADERS } from '../constants'
import * as loggerModule from '../clients/logger'
import { testLogger } from '../../test/factories/testLogger'
import { verifyAuth0Token } from '../clients/auth0'
import { testUser } from '@alwaystudios/recipe-bible-sdk'

jest.mock('../clients/auth0')

const authMock = verifyAuth0Token as jest.Mock

const err = jest.fn()
jest.spyOn(loggerModule, 'getLogger').mockReturnValue(testLogger({ err }))

const wrapped = wrap(deleteRecipeApi, { handler: 'endpoint' })
const deleteRecipe = jest.spyOn(recipeService, 'deleteRecipe')
const name = random.word()

describe('delete recipe API', () => {
  afterEach(jest.clearAllMocks)

  describe('DELETE /recipe/{name}', () => {
    it('deletes a recipe', async () => {
      authMock.mockResolvedValueOnce(testUser())
      deleteRecipe.mockResolvedValueOnce(undefined)
      const event = createAPIGatewayEventMock({
        httpMethod: 'DELETE',
        path: '/recipes',
        pathParameters: {
          name,
        },
      })

      const result = await wrapped.run(event)

      expect(authMock).toHaveBeenCalledTimes(1)
      expect(result.statusCode).toBe(200)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(deleteRecipe).toHaveBeenCalledTimes(1)
      expect(deleteRecipe).toHaveBeenCalledWith(name)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'ok',
      })
    })

    it('handles errors', async () => {
      authMock.mockResolvedValueOnce(testUser())
      deleteRecipe.mockRejectedValueOnce(new Error('boom'))
      const event = createAPIGatewayEventMock({
        httpMethod: 'DELETE',
        path: '/recipes',
        pathParameters: {
          name,
        },
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(500)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(err).toHaveBeenCalledTimes(1)
      expect(err).toHaveBeenCalledWith('Server error: Error: boom')
    })
  })
})
