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
  cost: number
  numberOfPieces: number
  recipeIngredients: RecipeIngredient[]
  insufficientIngredient?: InsufficientIngredient[]
}

export interface InsufficientIngredient {
  name: string
  ingredientId: string
  missingQuantity: number
  unit: Unit
}

export interface RecipeIngredient {
  id: string
  quantityNeeded: number
  cost: number
  recipe: Recipe
  ingredient: Ingredient
  unit: Unit
}

export interface AddToRecipe {
  recipeId: string
  ingredient: Ingredient
  quantityNeeded: number
  unit: Unit
}

export interface StockCreation {
  ingredient: string
  quantity: number
  unit: Unit
  expirationDate: Date
}

export interface Stock {
  id: string
  ingredient: Ingredient
  quantity: number
  unit: Unit
  expirationDate: Date
}
