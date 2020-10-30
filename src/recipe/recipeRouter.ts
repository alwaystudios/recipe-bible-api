import { RecipeRecord } from '@alwaystudios/recipe-bible-sdk'
import { Request, NextFunction, Response, Router } from 'express'
import { Pool } from 'pg'
import { omit } from 'ramda'
import { Logger } from 'winston'
import { checkJwt, userMiddleware } from '../server/authMiddleware'
import { middlewareError } from '../server/errorHandler'
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
    validateRecipeSchemaMiddleware,
    async (_: Request, res: Response, next: NextFunction) => {
      const { recipe } = res.locals
      const { title } = recipe
      // todo: set metadata, remove id, title via transformer toRecipeRecord() sdk
      await createRecipe(log, connectionPool, title, res.locals.user.sub, recipe)
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
      // todo: sdk toRecipeRecord() transformer
      const recipeRecord = omit(['title, id'], recipe) as RecipeRecord
      await updateRecipe(log, connectionPool, recipe.id, res.locals.user.sub, recipeRecord)
        .then((id) => res.status(200).send({ id }))
        .catch(middlewareError(next, `Unable to update recipe`))
    },
  )

  router.all('*', (_, res) => {
    res.sendStatus(405)
  })

  return router
}
