import * as asPg from '@alwaystudios/as-pg'
import { testSystemStatus, testSystemStatusRecord } from '../../test/testSystemStatus'
import { getSystemStatus } from './systemRepository'

const query = jest.fn()
const testClient = asPg.testPgClient({ query })
const testPool = asPg.testConnectionPool()

const runInPoolClientSpy = jest
  .spyOn(asPg, 'runInPoolClient')
  .mockImplementation(() => asPg.testRunInPoolClient(testClient))

describe('system repository', () => {
  beforeEach(jest.clearAllMocks)

  it('get system status', async () => {
    query.mockResolvedValueOnce({ rows: testSystemStatusRecord() })
    const result = await getSystemStatus(testPool)
    expect(runInPoolClientSpy).toHaveBeenCalledTimes(1)
    expect(runInPoolClientSpy).toHaveBeenCalledWith(testPool)
    expect(query).toHaveBeenCalledTimes(1)
    expect(query).toHaveBeenLastCalledWith(`select * from admin_options`)
    expect(result).toEqual(testSystemStatus())
  })
})
