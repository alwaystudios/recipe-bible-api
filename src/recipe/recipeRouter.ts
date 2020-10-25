import { Router } from 'express'
import { Pool } from 'pg'
import { Logger } from 'winston'
import { checkJwt } from '../authMiddleware'
import { middlewareError } from '../errorHandler'
import { createRecipe, getRecipes } from './recipeRepository'

export const createRecipeRouter = (log: Logger, connectionPool: Pool): Router => {
  const router = Router()

  router.get('/recipe', async (_, res, next) => {
    await getRecipes(connectionPool)
      .then((recipes) => res.send(recipes))
      .catch(middlewareError(next, `Unable to get recipes`))
  })

  router.post('/recipe', checkJwt, async (req, res, next) => {
    const { body } = req
    const { title } = body
    await createRecipe(log, connectionPool, title, 'todo: get userId from session', body)
      .then((id) => res.status(201).send({ id }))
      .catch(middlewareError(next, `Unable to save recipe`))
  })

  return router
}
