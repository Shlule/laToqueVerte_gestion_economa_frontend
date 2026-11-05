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
  /** Procédé : étapes de fabrication, dans l'ordre */
  steps?: string[]
  /** cuisson : durée en minutes et température en °C (null si sans cuisson) */
  cookingTime?: number | null
  cookingTemperature?: number | null
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
  lotNumber: string
  quantity: number
  unit: Unit
  expirationDate: string
}

export interface SupplierStock {
  id: string
  ingredient: Ingredient
  lotNumber?: string
  quantity: number
  unit: Unit
  expirationDate: Date
  archived?: boolean
}

export interface CraftedStockCreation {
  recipe: string
  lotNumber?: string
  quantity: number
  unit: Unit
  creationDate: string

}

export interface CraftedStock {
  id: string
  recipe: Recipe
  lotNumber?: string
  quantity: number
  unit: Unit
  creationDate: string
  expirationDate?: string | null
  /** quantité fabriquée au départ */
  initialQuantity?: number | null
  /** lot épuisé ou masqué : gardé pour l'historique */
  archived?: boolean
  movements?: StockMovement[]
}

export type StockMovementKind = 'sold' | 'waste' | 'used' | 'adjustment'

export interface StockMovement {
  id: string
  kind: StockMovementKind
  /** quantité retirée du lot (négative si un inventaire en trouve plus) */
  quantity: number
  date: string
  note: string
}

export interface StockMovementInput {
  kind: Exclude<StockMovementKind, 'used'>
  /** pour un inventaire : la quantité comptée */
  quantity: number
  date?: string
  note?: string
}

// ANCHOR - production (« faire la recette »)

export interface ProduceRequest {
  quantity: number
  unit: Unit
  lotNumber?: string
  creationDate?: string
  expirationDate?: string | null
  /** retirer des stocks les ingrédients et préparations utilisés */
  consumeStock: boolean
  dryRun?: boolean
}

export interface ConsumedLot {
  stockId: string
  lotNumber: string
  taken: number
  unit: Unit
  emptied: boolean
}

export interface ConsumptionLine {
  ingredientId?: string
  childRecipeId?: string
  name: string
  needed: number
  available: number
  missing: number
  unit: Unit
  lots: ConsumedLot[]
}

export interface ProduceResponse {
  stock: CraftedStock | null
  consumed?: boolean
  consumption: {
    factor: number
    ingredients: ConsumptionLine[]
    subRecipes: ConsumptionLine[]
    hasShortage: boolean
  }
}

// ANCHOR - assistant de création de recette (POST /recipes/compose)

export interface ComposeIngredientLine {
  ingredient: string
  quantityNeeded: number
  unit: Unit
}

export interface ComposeSubRecipeLine {
  childRecipe: string
  quantityNeeded: number
  unit: Unit
}

export interface RecipeCompose {
  name: string
  quantity: number
  unitType: Unit
  ingredients: ComposeIngredientLine[]
  subRecipes: ComposeSubRecipeLine[]
  steps: string[]
  cookingTime: number | null
  cookingTemperature: number | null
  /** true : calcule le coût sans rien enregistrer */
  dryRun?: boolean
}

export interface ComposedRecipe {
  id: string
  name: string
  cost: number
  costPerUnit: number
  quantity: number
  unitType: Unit
  steps: string[]
  recipeIngredients: { id: string, ingredient: Ingredient, quantityNeeded: number, unit: Unit, cost: number }[]
  subRecipes: { id: string, childRecipe: { id: string, name: string }, quantityNeeded: number, unit: Unit, cost: number }[]
}
