import { Recipe } from '@alwaystudios/recipe-bible-sdk'
import express from 'express'

export type ApiResponse = Omit<express.Response, 'locals'>

export type RecipeResponse = Omit<ApiResponse, 'locals'> & {
  locals: {
    recipe: Recipe
  }
}
