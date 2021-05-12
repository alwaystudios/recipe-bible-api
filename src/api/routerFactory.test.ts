/* eslint-disable import/named */
import { datatype } from 'faker'
import { NotFound } from 'http-errors'
import { createALBEventMock } from '../../test/factories/testProxyEvent'
import { createRouter } from './routerFactory'

const fakeHandler = jest.fn()

describe('router factory', () => {
  afterEach(jest.clearAllMocks)

  it('execute valid route', async () => {
    fakeHandler.mockResolvedValueOnce({ test: '123' })
    const awsRequestId = datatype.uuid()
    const event = createALBEventMock({ path: '/v1/handler/path' })
    const fakeRouters = {
      handler: fakeHandler,
    }
    const router = createRouter(fakeRouters)

    const result = await router.executeHandler(event, awsRequestId)

    expect(fakeHandler).toHaveBeenCalledTimes(1)

    expect(fakeHandler).toHaveBeenCalledWith({
      httpMethod: event.httpMethod,
      subsegments: ['path'],
      body: event.body,
      queryStringParameters: event.queryStringParameters,
      headers: {},
      awsRequestId,
    })
    expect(result).toEqual({ test: '123' })
  })

  it('execute invalid route', async () => {
    fakeHandler.mockResolvedValueOnce({ test: '123' })
    const awsRequestId = datatype.uuid()
    const event = createALBEventMock({ path: '/v1/invalid/path' })
    const fakeRouters = {
      handler: fakeHandler,
    }
    const router = createRouter(fakeRouters)

    expect(fakeHandler).not.toHaveBeenCalled()
    await expect(router.executeHandler(event, awsRequestId)).rejects.toEqual(new NotFound())
  })
})
