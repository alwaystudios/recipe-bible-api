declare type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> }

declare type APIResponse = { statusCode: number; body: string }

declare type Category =
  | 'Chicken'
  | 'Meat'
  | 'Fish'
  | 'Pasta'
  | 'Salads'
  | 'Vegetarian'
  | 'Vegan'
  | 'Soups'
  | 'Snacks'
  | 'Desserts'
  | 'Other'

declare type Nutrition = {
  fat?: string
  carbs?: string
  protein?: string
}

declare type Step = {
  imgSrc?: string
  step: string
}

declare type Metadata = {
  focused: boolean
  published: boolean
}

declare type Measure = 'qty' | 'g' | 'ml' | 'tsp' | 'tbsp' | 'handful' | 'cup' | 'slice(s)' | 'kg'

declare type Ingredient = {
  name: string
  quantity: string
  measure: Measure
}

declare type Recipe = {
  imgSrc: string
  title: string
  story: string
  categories: Category[]
  ingredients: Ingredient[]
  steps: Step[]
  metadata: Metadata
  ratings: number[]
  cookingTime: string
  prepTime: string
  youWillNeed: string[]
  servings: number
  nutrition: Nutrition
}

declare type User = {
  'https://recipebible.net/roles': string[]
  given_name: string
  family_name: string
  nickname: string
  name: string
  picture: string
  locale: string
  updated_at: string
  email: string
  email_verified: boolean
  iss: string
  sub: string
  aud: string
  iat: number
  exp: number
  at_hash: string
  nonce: string
}
