import { Router } from 'express'
import { Pool } from 'pg'
import { middlewareError } from '../errorHandler'
import { getRecipes } from './recipeRepository'

export const createRecipeRouter = (connectionPool: Pool): Router => {
  const router = Router()

  router.get('/recipe', async (_, res, next) => {
    await getRecipes(connectionPool)
      .then((recipes) => res.send(recipes))
      .catch(middlewareError(next, `Unable to get recipes`))
  })

  return router
}
