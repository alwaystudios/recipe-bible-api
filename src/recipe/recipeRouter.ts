import { Router } from 'express'
import { Pool } from 'pg'
import { getRecipes } from './recipeRepository'

// todo: error handling
export const createRecipeRouter = (connectionPool: Pool): Router => {
  const router = Router()

  router.get('/recipe', async (_, res) => {
    const recipes = await getRecipes(connectionPool)
    res.send(recipes)
  })

  return router
}
