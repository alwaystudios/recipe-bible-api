import { emptyRecipeRecord, toRecipeRecord } from '@alwaystudios/recipe-bible-sdk'
import { Request, NextFunction, Response, Router } from 'express'
import { Pool } from 'pg'
import { Logger } from 'winston'
import { checkJwt, userMiddleware } from '../../server/authMiddleware'
import { middlewareError } from '../../server/errorHandler'
import { validateRecipeMiddleware, validateRecipeSchemaMiddleware } from './recipeMiddleware'
import { createRecipe, getRecipes, updateRecipe } from './recipeRepository'

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
    userMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
      const { title } = req.body
      await createRecipe(log, connectionPool, title, res.locals.user.sub, emptyRecipeRecord())
        .then((id) => res.status(201).send({ id }))
        .catch(middlewareError(next, `Unable to create recipe`))
    },
  )

  router.patch(
    '/recipe',
    checkJwt,
    userMiddleware,
    validateRecipeSchemaMiddleware,
    validateRecipeMiddleware,
    async (_: Request, res: Response, next: NextFunction) => {
      const { recipe } = res.locals
      await updateRecipe(
        log,
        connectionPool,
        recipe.id,
        res.locals.user.sub,
        toRecipeRecord(recipe),
      )
        .then((id) => res.status(200).send({ id }))
        .catch(middlewareError(next, `Unable to update recipe`))
    },
  )

  return router
}
