import type { FetchOptions } from 'ofetch'
import type {
  AddSubRecipe,
  AddToRecipe,
  ComposedRecipe,
  CraftedStock,
  Ingredient,
  IngredientCreation,
  InsufficientIngredient,
  InsufficientSubRecipe,
  ProduceRequest,
  ProduceResponse,
  Recipe,
  RecipeCompose,
  RecipeIngredient,
  StockMovementInput,
  SubRecipe,
  SupplierStock,
  SupplierStockCreation,
} from '~/types'
import { FetchError, ofetch } from 'ofetch'

// Point d'entrée unique vers l'API REST.
// Pour changer de backend il suffit de modifier VITE_API_URL (voir .env.example)
// et, si besoin, les chemins ci-dessous.
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

/** Jeton CSRF posé par Django dans le cookie `csrftoken`. */
export function getCsrfToken(): string | undefined {
  if (typeof document === 'undefined')
    return
  return document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1]
}

/** Appelé quand l'API répond 401/403 (session expirée) : défini par le module d'auth. */
let onUnauthorized: (() => void) | undefined
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

export const api = ofetch.create({
  baseURL: API_BASE_URL,
  credentials: 'include',
  headers: { Accept: 'application/json' },
  onRequest({ options }) {
    const method = (options.method ?? 'GET').toUpperCase()
    const token = getCsrfToken()
    if (!SAFE_METHODS.has(method) && token)
      options.headers.set('X-CSRFToken', token)
  },
  onResponseError({ response }) {
    if (response.status === 401 || response.status === 403)
      onUnauthorized?.()
  },
})

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ApiRequestParams<TData> {
  method?: HttpMethod
  url: string
  data?: TData
  errorContext?: string
  options?: Omit<FetchOptions<'json'>, 'method' | 'body'>
}

/**
 * Requête générique : renvoie le corps JSON et lève une `Error` lisible en cas d'échec
 * (indispensable pour que TanStack Query passe en état `error`).
 */
export async function apiRequest<TResponse, TData = unknown>(params: ApiRequestParams<TData>): Promise<TResponse> {
  const { method = 'GET', url, data, errorContext, options } = params
  try {
    return await api<TResponse>(url, { ...options, method, body: data as BodyInit | Record<string, any> | undefined })
  }
  catch (error) {
    const context = errorContext
      ? ` (${errorContext})`
      : ''
    const message = error instanceof FetchError
      ? `${error.statusCode ?? 'réseau'} : ${error.data?.message ?? error.message}`
      : String(error)
    console.error(`Erreur API${context}`, error)
    throw new Error(`Une erreur est survenue${context} – ${message}`)
  }
}

// ANCHOR - Ingrédients
export function getAllIngredient() {
  return apiRequest<Ingredient[]>({ url: '/ingredients', errorContext: 'récupération des ingrédients' })
}

export function createIngredient(newIngredient: IngredientCreation) {
  return apiRequest<Ingredient>({
    method: 'POST',
    url: '/ingredients',
    data: newIngredient,
    errorContext: 'création de l\'ingrédient',
  })
}

export function editIngredient(ingredient: Ingredient) {
  return apiRequest<Ingredient>({
    method: 'PUT',
    url: `/ingredients/${ingredient.id}`,
    data: ingredient,
    errorContext: `modification de l'ingrédient ${ingredient.id}`,
  })
}

export function removeIngredient(ingredientId: string) {
  return apiRequest<void>({ method: 'DELETE', url: `/ingredients/${ingredientId}`, errorContext: `suppression de l'ingrédient ${ingredientId}` })
}

// ANCHOR - Recettes
export function getAllRecipe() {
  return apiRequest<Recipe[]>({ url: '/recipes', errorContext: 'récupération des recettes' })
}

export function getRecipe(recipeId: string) {
  return apiRequest<Recipe>({ url: `/recipes/${recipeId}`, errorContext: `récupération de la recette ${recipeId}` })
}

export function createRecipe(newRecipe: Partial<Recipe>) {
  return apiRequest<Recipe>({
    method: 'POST',
    url: '/recipes',
    data: newRecipe,
    errorContext: 'création de la recette',
  })
}

/** Crée une recette complète en une fois (ou calcule seulement son coût avec `dryRun`). */
export function composeRecipe(recipe: RecipeCompose) {
  return apiRequest<ComposedRecipe>({
    method: 'POST',
    url: '/recipes/compose',
    data: recipe,
    errorContext: 'création de la recette',
  })
}

export function editRecipe(recipe: Recipe) {
  return apiRequest<Recipe>({
    method: 'PUT',
    url: `/recipes/${recipe.id}`,
    data: recipe,
    errorContext: `modification de la recette ${recipe.id}`,
  })
}

export function getInsufficientIngredients(recipeId: string) {
  return apiRequest<InsufficientIngredient[]>({ url: `/recipes/${recipeId}/insufficientIngredients`, errorContext: `ingrédients manquants de la recette ${recipeId}` })
}

export function getInsufficientSubRecipes(recipeId: string) {
  return apiRequest<InsufficientSubRecipe[]>({ url: `/recipes/${recipeId}/insufficientSubRecipes`, errorContext: `sous-recettes manquantes de la recette ${recipeId}` })
}

// ANCHOR - Ingrédients d'une recette
export function getAllRecipeIngredientByRecipe(recipeId: string) {
  return apiRequest<RecipeIngredient[]>({ url: `/recipe-ingredients/byRecipe/${recipeId}`, errorContext: `ingrédients de la recette ${recipeId}` })
}

export function createRecipeIngredient(list: AddToRecipe[]) {
  return apiRequest<RecipeIngredient[]>({
    method: 'POST',
    url: '/recipe-ingredients',
    data: list,
    errorContext: 'ajout d\'ingrédients à la recette',
  })
}

export function editRecipeIngredient(recipeIngredient: RecipeIngredient) {
  return apiRequest<RecipeIngredient>({
    method: 'PUT',
    url: `/recipe-ingredients/${recipeIngredient.id}`,
    data: recipeIngredient,
    errorContext: `modification de l'ingrédient de recette ${recipeIngredient.id}`,
  })
}

export function deleteRecipeIngredient(recipeIngredientId: string) {
  return apiRequest<void>({ method: 'DELETE', url: `/recipe-ingredients/${recipeIngredientId}`, errorContext: `suppression de l'ingrédient de recette ${recipeIngredientId}` })
}

// ANCHOR - Sous-recettes
export function getAllSubRecipeByRecipe(recipeId: string) {
  return apiRequest<SubRecipe[]>({ url: `/sub-recipes/byParentRecipe/${recipeId}`, errorContext: `sous-recettes de la recette ${recipeId}` })
}

export function createSubRecipe(list: AddSubRecipe[]) {
  return apiRequest<SubRecipe[]>({
    method: 'POST',
    url: '/sub-recipes',
    data: list,
    errorContext: 'ajout de sous-recettes',
  })
}

export function editSubRecipe(subRecipe: SubRecipe) {
  return apiRequest<SubRecipe>({
    method: 'PUT',
    url: `/sub-recipes/${subRecipe.id}`,
    data: subRecipe,
    errorContext: `modification de la sous-recette ${subRecipe.id}`,
  })
}

export function deleteSubRecipe(subRecipeId: string) {
  return apiRequest<void>({ method: 'DELETE', url: `/sub-recipes/${subRecipeId}`, errorContext: `suppression de la sous-recette ${subRecipeId}` })
}

// ANCHOR - Stocks fournisseur
export function getAllStocksByIngredient(ingredientId: string) {
  return apiRequest<SupplierStock[]>({ url: `/supplier-stocks/byIngredient/${ingredientId}`, errorContext: `stocks de l'ingrédient ${ingredientId}` })
}

export function createStock(newStock: SupplierStockCreation) {
  return apiRequest<SupplierStock>({
    method: 'POST',
    url: '/supplier-stocks',
    data: newStock,
    errorContext: 'création du stock',
  })
}

export function editStock(stock: SupplierStock) {
  return apiRequest<SupplierStock>({
    method: 'PUT',
    url: `/supplier-stocks/${stock.id}`,
    data: stock,
    errorContext: `modification du stock ${stock.id}`,
  })
}

export function deleteStock(stockId: string) {
  return apiRequest<void>({ method: 'DELETE', url: `/supplier-stocks/${stockId}`, errorContext: `suppression du stock ${stockId}` })
}

// ANCHOR - Stocks de préparations (recettes fabriquées)
/** Lots d'une recette ; `all` inclut les lots épuisés ou masqués (historique). */
export function getCraftedStocksByRecipe(recipeId: string, all = false) {
  return apiRequest<CraftedStock[]>({
    url: `/crafted-stocks/byRecipe/${recipeId}${all ? '?all=1' : ''}`,
    errorContext: `stocks de la recette ${recipeId}`,
  })
}

/** Vente, perte ou inventaire sur un lot. */
export function addStockMovement(stockId: string, movement: StockMovementInput) {
  return apiRequest<CraftedStock>({
    method: 'POST',
    url: `/crafted-stocks/${stockId}/movement`,
    data: movement,
    errorContext: 'mouvement de stock',
  })
}

/** Masque (archive) ou réaffiche un lot. */
export function setCraftedStockArchived(stockId: string, archived: boolean) {
  return apiRequest<CraftedStock>({
    method: 'PATCH',
    url: `/crafted-stocks/${stockId}`,
    data: { archived },
    errorContext: 'archivage du lot',
  })
}

export function deleteCraftedStock(stockId: string) {
  return apiRequest<void>({ method: 'DELETE', url: `/crafted-stocks/${stockId}`, errorContext: `suppression du stock ${stockId}` })
}

/** Fabrique une recette (ou calcule seulement ce qui serait retiré des stocks avec `dryRun`). */
export function produceRecipe(recipeId: string, request: ProduceRequest) {
  return apiRequest<ProduceResponse>({
    method: 'POST',
    url: `/recipes/${recipeId}/produce`,
    data: request,
    errorContext: 'fabrication de la recette',
  })
}
