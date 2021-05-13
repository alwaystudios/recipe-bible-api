declare type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> }

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

declare const categories: Category[] = [
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
