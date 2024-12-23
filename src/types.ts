import type { ViteSSGContext } from 'vite-ssg'

export type UserModule = (ctx: ViteSSGContext) => void

export const units = {
  kg: 'kg',
  g: 'g',
  unit: 'unit',
} as const

export type Unit = typeof units[keyof typeof units]

export type IngredientCreation = Omit<Ingredient, 'RecipeIngredients' | 'stock' | 'id'>

export interface Ingredient {
  id: string
  name: string
  pricePerUnit: number
  fournisseur: string
  unitType: Unit
  RecipeIngredients: RecipeIngredient[]
  stock: Stock

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

export interface StockCreation {
  ingredientId: string
  quantity: number
  unit: Unit
  expirationDate: string
}

export interface Stock {
  id: string
  ingredient: Ingredient
  quantity: number
  unit: Unit
  expirationDate?: Date
}
