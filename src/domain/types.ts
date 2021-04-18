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
	reviewed: boolean
	published: boolean
}

export enum Measure {
	quantity = 'qty',
	grams = 'g',
	milliliters = 'ml',
	teaSpoon = 'tsp',
	tableSpoon = 'tbsp',
	handful = 'handful',
	cup = 'cup',
	slice = 'slice(s)',
	kg = 'kg',
}

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
	categories: string[]
	ingredients: string[]
	steps: Step[]
	metadata: Metadata
	ratings: number[]
	cookingTime: string
	prepTime: string
	youWillNeed: string[]
	servings: number
	nutrition: Nutrition
}
