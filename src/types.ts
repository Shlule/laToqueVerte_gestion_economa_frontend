import type { ViteSSGContext } from 'vite-ssg'

export type UserModule = (ctx: ViteSSGContext) => void

export const units = {
  kg: 'kg',
  g: 'g',
  unit: 'unit',
} as const

export type Unit = typeof units[keyof typeof units]

export interface Ingredient {
  id: string
  name: string
  pricePerKg: number
  unit: Unit
  RecipeIngredients?: RecipeIngredient[]
  stock?: Stock

}

export interface Recipe {
  id: string
  name: string
  isPossible: boolean
  cost: number
  recipeIngredients?: RecipeIngredient[]
}

export interface RecipeIngredient {
  id: string
  quantityNeeded: number
  recipe: Recipe
  ingredient: Ingredient
  unit: Unit
}

export interface Stock {
  id: string
  ingredient: Ingredient
  quantity: number
  unit: Unit
  expirationDate?: Date
}
