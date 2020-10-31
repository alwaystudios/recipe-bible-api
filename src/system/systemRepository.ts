import { runInPoolClient } from '@alwaystudios/as-pg'
import { Pool, PoolClient } from 'pg'

export type SystemStatus = ReadonlyArray<{
  setting: string
  value: string
}>

export const getSystemStatus = async (pool: Pool): Promise<SystemStatus> =>
  runInPoolClient(pool)((client: PoolClient) =>
    client.query(`select * from admin_options`).then(({ rows }) =>
      rows.map((row) => ({
        setting: row.setting,
        value: row.setting_value,
      })),
    ),
  )
