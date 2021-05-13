import { wrap } from 'lambda-wrapper'
import * as handler from './recipes'
import * as recipeService from '../domain/recipeService'
import { testRecipe } from '../../test/factories/testFactories'
import { createAPIGatewayEventMock } from '../../test/factories/proxyEventMock'

const wrapped = wrap(handler, { handler: 'endpoint' })
const getRecipes = jest.spyOn(recipeService, 'getRecipes')

describe('GET recipes API', () => {
  it('returns all recipes', async () => {
    const data = [testRecipe(), testRecipe()]
    getRecipes.mockResolvedValueOnce(data)
    const event = createAPIGatewayEventMock({
      httpMethod: 'GET',
      path: '/recipes',
    })

    const result = await wrapped.run(event)

    expect(getRecipes).toHaveBeenCalledTimes(1)
    expect(getRecipes).toHaveBeenCalledWith({ focused: 'all', published: true })
    expect(JSON.parse(result.body)).toMatchObject({
      status: 'ok',
      data,
    })
  })

  it('handles errors', async () => {
    getRecipes.mockRejectedValueOnce(new Error('boom'))
    const event = createAPIGatewayEventMock({
      httpMethod: 'GET',
      path: '/recipes',
    })

    const result = await wrapped.run(event)

    expect(JSON.parse(result.body)).toMatchObject({
      status: 'error',
    })
  })
})
