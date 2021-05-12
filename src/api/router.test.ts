import { wrap } from 'lambda-wrapper'
import { createALBEventMock } from '../../test/factories/testProxyEvent'
import * as routerFactory from './routerFactory'
import * as handler from './router'
import { datatype } from 'faker'

const fakeHandler = jest.fn()
const fakeRouter = { executeHandler: fakeHandler }

jest.spyOn(routerFactory, 'createRouter').mockImplementation(() => fakeRouter)

const wrapped = wrap(handler, { handler: 'endpoint' })

const awsRequestId = datatype.uuid()
const event = createALBEventMock({
  httpMethod: 'PUT',
  path: '/some/route',
  body: '123',
  queryStringParameters: {
    foo: 'bar',
  },
  headers: {
    test: '1234',
  },
})

describe('router', () => {
  afterEach(jest.clearAllMocks)

  it('runs execute handler', async () => {
    fakeHandler.mockResolvedValueOnce({ statusCode: 200 })

    const result = await wrapped.run(event, { awsRequestId })

    expect(result.statusCode).toBe(200)
    expect(fakeHandler).toHaveBeenCalledTimes(1)
    expect(fakeHandler).toHaveBeenCalledWith(expect.objectContaining(event), awsRequestId)
  })
})
