import type { App } from 'vue'
import type { Router } from 'vue-router'

export interface UserModuleContext {
  app: App
  router: Router
}

export type UserModule = (ctx: UserModuleContext) => void

export const units = {
  kg: 'kg',
  g: 'g',
  unit: 'unit',
} as const

export type Unit = typeof units[keyof typeof units]

export type IngredientCreation = Omit<Ingredient, 'RecipeIngredients' | 'stocks' | 'id'>

export interface Ingredient {
  id: string
  name: string
  pricePerUnit: number
  fournisseur: string
  unitType: Unit
  RecipeIngredients: RecipeIngredient[]
  stocks: SupplierStock[]

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
  stocks: CraftedStock[]
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

export interface SupplierStockCreation {
  ingredient: string
  quantity: number
  unit: Unit
  expirationDate: string
}

export interface SupplierStock {
  id: string
  ingredient: Ingredient
  quantity: number
  unit: Unit
  expirationDate: Date
}

export interface CraftedStockCreation {
  recipe: string
  quantity: number
  unit: Unit
  creationDate: string

}

export interface CraftedStock {
  id: string
  recipe: Recipe
  quantity: number
  unit: Unit
  creationDate: Date
}
