import { validateRecipeSchema } from '@alwaystudios/recipe-bible-sdk'
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
