import * as sdk from '@alwaystudios/recipe-bible-sdk'
import { Request } from 'express'
import { RecipeResponse } from '../../server/types'
import { validateRecipeMiddleware, validateRecipeSchemaMiddleware } from './recipeMiddleware'

const validateRecipe = jest.spyOn(sdk, 'validateRecipe')
const validateRecipeSchema = jest.spyOn(sdk, 'validateRecipeSchema')
const recipe = sdk.testRecipe('test')

describe('recipe middleware', () => {
  const next = jest.fn()

  beforeEach(jest.resetAllMocks)

  describe('validate recipe middleware', () => {
    it('validates a recipe', () => {
      const res = { locals: { recipe } } as RecipeResponse

      validateRecipe.mockReturnValueOnce(null)

      validateRecipeMiddleware({ body: recipe } as Request, res, next)

      expect(res.locals.recipe).toEqual(recipe)
      expect(validateRecipe).toHaveBeenCalledTimes(1)
      expect(validateRecipe).toHaveBeenCalledWith(recipe)
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
    })

    it('calls next with validation error', () => {
      const res = { locals: { recipe } } as RecipeResponse
      const error = new sdk.RecipeValidationError('some error', [])

      validateRecipe.mockReturnValueOnce(error)

      validateRecipeMiddleware({ body: recipe } as Request, res, next)

      expect(res.locals.recipe).toEqual(recipe)
      expect(validateRecipe).toHaveBeenCalledTimes(1)
      expect(validateRecipe).toHaveBeenCalledWith(recipe)
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('validate recipe schema middleware', () => {
    it('validates a recipe schema', () => {
      const res = { locals: {} } as RecipeResponse

      validateRecipeSchema.mockReturnValueOnce(recipe)
      validateRecipeSchemaMiddleware({ body: recipe } as Request, res, next)

      expect(res.locals.recipe).toEqual(recipe)
      expect(validateRecipeSchema).toHaveBeenCalledTimes(1)
      expect(validateRecipeSchema).toHaveBeenCalledWith(recipe)
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
    })

    it('calls next with validation error', () => {
      const res = { locals: { recipe } } as RecipeResponse
      const error = new sdk.RecipeValidationError('some error', [])
      const invalidRecipe = { ...recipe, steps: [] }

      validateRecipeSchema.mockImplementationOnce(() => {
        throw error
      })
      validateRecipeSchemaMiddleware({ body: invalidRecipe } as Request, res, next)

      expect(validateRecipeSchema).toHaveBeenCalledTimes(1)
      expect(validateRecipeSchema).toHaveBeenCalledWith(invalidRecipe)
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith(error)
    })
  })
})
