import { Recipe } from '@alwaystudios/recipe-bible-sdk'
import { pathOr } from 'ramda'

const toApiRecipe = (recipe: Recipe, fields?: string[]): Partial<Recipe> =>
  fields
    ? fields.reduce((acc, field) => ({ ...acc, [field]: pathOr(undefined, [field], recipe) }), {})
    : recipe

const toApiRecipes = (recipes: Recipe[], fields?: string[]): Array<Partial<Recipe>> =>
  fields ? recipes.map((recipe) => toApiRecipe(recipe, fields)) : recipes

export const toApiRecipeResponseData = (
  incoming: Recipe | Recipe[],
  fields?: string[]
): Partial<Recipe> | Array<Partial<Recipe>> =>
  Array.isArray(incoming) ? toApiRecipes(incoming, fields) : toApiRecipe(incoming, fields)
