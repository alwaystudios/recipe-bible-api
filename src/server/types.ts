import { Recipe } from '@alwaystudios/recipe-bible-sdk'
import express from 'express'

type Locals = {
  user?: {
    sub: string
    roles: ReadonlyArray<string>
  }
}

export type ApiResponse = Omit<express.Response, 'locals'> & {
  locals: Locals
}

export type RecipeResponse = Omit<ApiResponse, 'locals'> & {
  locals: Locals & {
    recipe: Recipe
  }
}

type UserDetails = Readonly<{
  sub: string
  'https://recipebible.net/roles': ReadonlyArray<string>
}>

export type ApiRequest = express.Request & {
  user?: UserDetails
}
