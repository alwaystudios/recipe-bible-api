import { validateRecipe, validateRecipeSchema } from '@alwaystudios/recipe-bible-sdk'
import { NextFunction, Request, Response } from 'express'

export const validateRecipeSchemaMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const recipe = validateRecipeSchema(req.body)
    res.locals = { ...res.locals, recipe }
    next()
  } catch (error) {
    next(error)
  }
}

export const validateRecipeMiddleware = (_: Request, res: Response, next: NextFunction): void => {
  try {
    const { recipe } = res.locals
    const validationError = validateRecipe(recipe)
    if (validationError) {
      throw validationError
    }
    res.locals = { ...res.locals, recipe }
    next()
  } catch (error) {
    next(error)
  }
}
