import { runInPoolClient } from '@alwaystudios/as-pg'
import { RecipeList, Recipe } from '@alwaystudios/recipe-bible-sdk'
import { Pool, PoolClient } from 'pg'
import { omit } from 'ramda'
import { Logger } from 'winston'

export const getRecipes = async (pool: Pool): Promise<RecipeList> =>
  runInPoolClient(pool)((client: PoolClient) =>
    client
      .query(
        `select title from recipe where coalesce(details->'metadata'->'reviewed', 'false') = 'true'`,
      )
      .then(({ rows }) => rows),
  )

export const createRecipe = async (
  log: Logger,
  pool: Pool,
  title: string,
  userId: string,
  recipe: Recipe,
): Promise<number> =>
  runInPoolClient(pool)((client: PoolClient) =>
    client
      .query('insert into recipe (title, details, userId) values ($1, $2, $3) returning id', [
        title,
        omit(['id, title'], recipe),
        userId,
      ])
      .then(({ rows }) => {
        return rows[0].id as number
      })
      .catch((err) => {
        log.error(err)
        throw new Error('repository error')
      }),
  )
