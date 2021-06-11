import { wrap } from 'lambda-wrapper'
import * as manageIngredients from './manageIngredients'
import * as ingredientService from '../domain/ingredientService'
import { testUser } from '@alwaystudios/recipe-bible-sdk'
import { createAPIGatewayEventMock } from '../../test/factories/proxyEventMock'
import { verifyAuth0Token } from '../clients/auth0'
import { random } from 'faker'
import { CORS_HEADERS } from '../constants'

jest.mock('../clients/auth0')

const authMock = verifyAuth0Token as jest.Mock
const wrapped = wrap(manageIngredients, { handler: 'endpoint' })
const saveIngredient = jest.spyOn(ingredientService, 'saveIngredient')
const saveIngredients = jest.spyOn(ingredientService, 'saveIngredients')

describe('manage ingredients API', () => {
  afterEach(jest.clearAllMocks)

  describe('PUT /ingredients', () => {
    it('saves an ingredient', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const ingredient = random.word()
      saveIngredient.mockResolvedValueOnce(undefined)
      const event = createAPIGatewayEventMock({
        httpMethod: 'PUT',
        path: '/ingredients',
        body: JSON.stringify({ ingredient }),
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(200)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(saveIngredients).not.toHaveBeenCalled()
      expect(saveIngredient).toHaveBeenCalledTimes(1)
      expect(saveIngredient).toHaveBeenCalledWith(ingredient)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'ok',
      })
    })

    it('rejects missing ingredient data', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const event = createAPIGatewayEventMock({
        httpMethod: 'PUT',
        path: '/ingredients',
        body: JSON.stringify({}),
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(400)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(saveIngredient).not.toHaveBeenCalled()
      expect(saveIngredients).not.toHaveBeenCalled()
    })

    it('imports ingredients', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const ingredients = [random.word(), random.word()]
      saveIngredients.mockResolvedValueOnce(undefined)
      const event = createAPIGatewayEventMock({
        httpMethod: 'PUT',
        path: '/ingredients',
        queryStringParameters: {
          import: 'true',
        },
        body: JSON.stringify({ ingredients }),
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(200)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(saveIngredient).not.toHaveBeenCalled()
      expect(saveIngredients).toHaveBeenCalledTimes(1)
      expect(saveIngredients).toHaveBeenCalledWith(ingredients)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'ok',
      })
    })

    it('rejects an empty payload', async () => {
      authMock.mockResolvedValueOnce(testUser())
      const event = createAPIGatewayEventMock({
        httpMethod: 'PUT',
        path: '/ingredients',
        body: '',
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(400)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(saveIngredient).not.toHaveBeenCalled()
      expect(saveIngredients).not.toHaveBeenCalled()
    })

    it('requires the admin role', async () => {
      authMock.mockResolvedValueOnce(testUser({ 'https://recipebible.net/roles': ['non-admin'] }))
      const event = createAPIGatewayEventMock({
        httpMethod: 'PUT',
        path: '/ingredients',
        body: JSON.stringify({ test: '123' }),
      })

      const result = await wrapped.run(event)

      expect(result.statusCode).toBe(403)
      expect(result.headers).toEqual(CORS_HEADERS)
      expect(JSON.parse(result.body)).toMatchObject({
        status: 'error',
      })
      expect(saveIngredient).not.toHaveBeenCalled()
      expect(saveIngredients).not.toHaveBeenCalled()
    })
  })
})
