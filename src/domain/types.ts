export type Category =
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

export const categories: Category[] = [
  'Chicken',
  'Meat',
  'Fish',
  'Pasta',
  'Salads',
  'Vegetarian',
  'Vegan',
  'Soups',
  'Snacks',
  'Desserts',
  'Other',
]

export type Nutrition = {
  fat: string
  carbs: string
  protein: string
}

export type Step = {
  imgSrc: string
  step: string
}

export type Metadata = {
  focused: boolean
  published: boolean
}

export type Measure = 'qty' | 'g' | 'ml' | 'tsp' | 'tbsp' | 'handful' | 'cup' | 'slice(s)' | 'kg'

export type Ingredient = {
  name: string
  quantity: string
  measure: Measure
  link?: string
}

export type Recipe = {
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
