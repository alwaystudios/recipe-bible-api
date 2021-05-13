import { lorem, system } from 'faker'

export const testIngredient = (overrides?: Partial<Ingredient>): Ingredient => ({
  name: lorem.word(),
  quantity: '2',
  measure: 'g',
  ...overrides,
})

export const testRecipe = (overrides?: Partial<Recipe>): Recipe => ({
  title: lorem.words(3),
  imgSrc: system.fileName(),
  story: lorem.words(3),
  categories: ['Chicken'],
  ingredients: [testIngredient()],
  steps: [],
  metadata: {
    focused: false,
    published: false,
  },
  ratings: [],
  cookingTime: '20 mins',
  prepTime: '5 mins',
  youWillNeed: [],
  servings: 2,
  nutrition: {
    fat: '',
    carbs: '',
    protein: '',
  },
  ...overrides,
})
