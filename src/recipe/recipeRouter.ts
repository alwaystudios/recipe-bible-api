import { Request, NextFunction, Response, Router } from 'express'
import { Pool } from 'pg'
import { Logger } from 'winston'
import { checkJwt } from '../server/authMiddleware'
import { middlewareError } from '../server/errorHandler'
import { validateRecipeSchemaMiddleware } from './middleware'
import { createRecipe, getRecipes } from './recipeRepository'

export const createRecipeRouter = (log: Logger, connectionPool: Pool): Router => {
  const router = Router()

  router.get('/recipe', async (_, res, next) => {
    await getRecipes(connectionPool)
      .then((recipes) => res.send(recipes))
      .catch(middlewareError(next, `Unable to get recipes`))
  })

  router.post(
    '/recipe',
    checkJwt,
    validateRecipeSchemaMiddleware,
    async (_: Request, res: Response, next: NextFunction) => {
      const { recipe } = res.locals
      const { title } = recipe
      await createRecipe(log, connectionPool, title, 'todo: get userId from session', recipe)
        .then((id) => res.status(201).send({ id }))
        .catch(middlewareError(next, `Unable to save recipe`))
    },
  )

  return router
}
