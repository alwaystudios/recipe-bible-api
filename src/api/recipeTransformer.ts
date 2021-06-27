import { Recipe } from '@alwaystudios/recipe-bible-sdk'
import { pathOr } from 'ramda'

const DEFAULT_METADATA = {
  focused: false,
  published: false,
}

const toApiRecipe = (recipe: Recipe, fields?: string[]): Partial<Recipe> => {
  const metadata = { ...DEFAULT_METADATA, ...recipe.metadata }
  const _recipe = fields
    ? fields.reduce((acc, field) => ({ ...acc, [field]: pathOr(undefined, [field], recipe) }), {})
    : recipe

  return { ..._recipe, metadata }
}

const toApiRecipes = (recipes: Recipe[], fields?: string[]): Array<Partial<Recipe>> =>
  fields ? recipes.map((recipe) => toApiRecipe(recipe, fields)) : recipes

export const toApiRecipeResponseData = (
  incoming: Recipe | Recipe[],
  fields?: string[]
): Partial<Recipe> | Array<Partial<Recipe>> =>
  Array.isArray(incoming) ? toApiRecipes(incoming, fields) : toApiRecipe(incoming, fields)
