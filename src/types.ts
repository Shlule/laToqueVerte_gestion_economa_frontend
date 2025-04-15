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
  quantity: number
  unitType: Unit
  recipeIngredients: RecipeIngredient[]
  insufficientIngredient?: InsufficientIngredient[]
  subRecipes?: SubRecipe[]
  insufficientSubRecipe: InsufficientSubRecipe[]
}

export interface InsufficientIngredient {
  name: string
  ingredientId: string
  missingQuantity: number
  unit: Unit
}

export interface InsufficientSubRecipe {
  name: string
  childRecipeId: string
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

export interface SubRecipe {
  id: string
  quantityNeeded: number
  cost: number
  unit: Unit
  parentRecipe: Recipe
  childRecipe: Recipe
}

export interface AddToRecipe {
  recipeId: string
  ingredient: Ingredient
  quantityNeeded: number
  unit: Unit
}

export interface AddSubRecipe {
  parentRecipeId: string
  childRecipe: Recipe
  quantityNeeded: number
  unit: Unit
}

export interface StockCreation {
  ingredient: string
  quantity: number
  unit: Unit
  expirationDate: string
}

export interface Stock {
  id: string
  ingredient: Ingredient
  quantity: number
  unit: Unit
  expirationDate: Date
}
