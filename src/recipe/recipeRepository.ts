import { runInPoolClient } from '@alwaystudios/as-pg'
import { Pool, PoolClient } from 'pg'
import { RecipeList } from '../types'

export const getRecipes: (pool: Pool) => Promise<RecipeList> = async (pool: Pool) =>
  runInPoolClient(pool)((client: PoolClient) =>
    client
      .query(
        `select title from recipe where coalesce(details->'metadata'->'reviewed', 'false') = 'true'`,
      )
      .then(({ rows }) => rows),
  )
