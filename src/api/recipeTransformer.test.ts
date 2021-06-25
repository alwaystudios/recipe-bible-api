import { testRecipe } from '@alwaystudios/recipe-bible-sdk'
import { toApiRecipeResponseData } from './recipeTransformer'

describe('api recipe transformer', () => {
  it('transforms a single recipe to api data with selected fields', () => {
    const recipe = testRecipe()
    const result = toApiRecipeResponseData(recipe, ['imgSrc', 'title'])
    expect(result).toEqual({
      imgSrc: recipe.imgSrc,
      title: recipe.title,
      metadata: recipe.metadata,
    })
  })

  it('transforms a single recipe to api data without selected fields', () => {
    const recipe = testRecipe()
    const result = toApiRecipeResponseData(recipe)
    expect(result).toEqual(recipe)
  })

  it('transforms a single recipe to api data without metadata to defaults', () => {
    const recipe = testRecipe({ metadata: undefined })
    const result = toApiRecipeResponseData(recipe)
    expect(result).toEqual({ ...recipe, metadata: { focused: false, published: false } })
  })

  it('ignores unknown keys', () => {
    const recipe = testRecipe()
    const result = toApiRecipeResponseData(recipe, ['imgSrc', 'title', 'unknown'])
    expect(result).toEqual({
      imgSrc: recipe.imgSrc,
      title: recipe.title,
      metadata: recipe.metadata,
    })
  })

  it('transforms recipes to api data with selected fields', () => {
    const recipe1 = testRecipe()
    const recipe2 = testRecipe()
    const recipes = [recipe1, recipe2]
    const result = toApiRecipeResponseData(recipes, ['imgSrc', 'title'])
    expect(result).toEqual(
      recipes.map((recipe) => ({
        imgSrc: recipe.imgSrc,
        title: recipe.title,
        metadata: recipe.metadata,
      }))
    )
  })

  it('transforms recipes to api data without selected fields', () => {
    const recipe1 = testRecipe()
    const recipe2 = testRecipe()
    const recipes = [recipe1, recipe2]
    const result = toApiRecipeResponseData(recipes)
    expect(result).toEqual(recipes)
  })
})
