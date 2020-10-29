import { runInPoolClient, verifyAtLeastOneRow } from '@alwaystudios/as-pg'
import { RecipeList, Recipe, RecipeRecord } from '@alwaystudios/recipe-bible-sdk'
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

export const updateRecipe = async (
  log: Logger,
  pool: Pool,
  id: number,
  userId: string,
  recipeRecord: RecipeRecord,
): Promise<void> =>
  runInPoolClient(pool)((client: PoolClient) =>
    // todo: move userId from recipe table and use chef id lookup
    client
      .query('update recipe set details = $1 where id = $2 and userId = $3', [
        recipeRecord,
        id,
        userId,
      ])
      .then(verifyAtLeastOneRow('update recipe'))
      .catch((err) => {
        log.error(err)
        throw new Error('repository error')
      }),
  )
