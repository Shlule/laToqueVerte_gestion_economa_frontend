import axios from 'axios'
import { useAxios } from '@vueuse/integrations/useAxios'
import type { Ingredient, IngredientCreation, Recipe, RecipeIngredient, Stock, StockCreation } from '~/types'

const economa_backend_api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export async function editRecipeIngredient(newRecipeIngredientData: RecipeIngredient) {
  try {
    const response = await economa_backend_api.put<RecipeIngredient>(`/recipe-ingredients/${newRecipeIngredientData.id}`, newRecipeIngredientData)
    return response.data
  }
  catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`An error has occur during update recipeIngredient ${newRecipeIngredientData.id}`)
      throw new Error(error.message || ' an error has occur')
    }
  }
  console.error(`An error has occur during update recipe ${newRecipeIngredientData.id}`)
}

export function removeRecipeIngredient(recipeIngredientId: string) {
  return useAxios<void>(`/recipe-ingredients/${recipeIngredientId}`, { method: 'DELETE' }, economa_backend_api)
}

// SECTION - get this form and don't use useAxios for using tanStackQuery
export async function getAllRecipeIngredientByRecipe(recipeId: string): Promise<RecipeIngredient[] | undefined> {
  try {
    const response = await economa_backend_api.get<RecipeIngredient[]>(`/recipe-ingredients/byRecipe/${recipeId}`)
    return response.data
  }
  catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error occur during ingredient fetching:', error)

      throw new Error(error.message || 'An error has occur')
    }
    console.error('Error occur during ingredient fetching:', error)
  }
}
// !SECTION

// here useAxios does not provide response correctly
// impossible to access value with useAxios because return undefined value
export async function createIngredient(newIngredient: IngredientCreation) {
  try {
    const response = await economa_backend_api.post<Ingredient>('/ingredients', newIngredient)
    return response
  }
  catch (error) {
    console.error('Error during ingredient creation', error)
    return error
  }
}

export function removeIngredient(ingredientId: string) {
  return useAxios<void>(`/ingredients/${ingredientId}`, { method: 'DELETE' }, economa_backend_api)
}

export function getAllIngredient() {
  return useAxios<Ingredient[]>('/ingredients', { method: 'GET' }, economa_backend_api)
}

export function editIngredient(newIngredientData: Ingredient) {
  return useAxios<Ingredient>(`/ingredients/${newIngredientData.id}`, { method: 'PUT', data: newIngredientData }, economa_backend_api)
}

// export function getAllRecipe() {
//   return useAxios<Recipe[]>('/recipes', { method: 'GET' }, economa_backend_api)
// }

// SECTION - use this form for tanStackQuery uses
export async function getAllRecipe(): Promise<Recipe[] | undefined> {
  try {
    const response = await economa_backend_api.get<Recipe[]>('/recipes')
    return response.data
  }
  catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('An error has occur during fetching allRecipe')
      throw new Error(error.message || 'An error has occur during fetching allRecipe')
    }
    console.error('An error has occur during fetching allRecipe')
  }
}
// !SECTION

export function getRecipe(recipeId: string) {
  return useAxios<Recipe>(`/recipes/${recipeId}`, { method: 'GET' }, economa_backend_api)
}

export function createRecipe() {
  return useAxios<Recipe>('/recipes', { method: 'POST' }, economa_backend_api)
}

// export function editRecipe(newRecipeData: Recipe) {
//   return useAxios<Recipe>(`/recipes/${newRecipeData.id}`, { method: 'PUT', data: newRecipeData }, economa_backend_api)
// }

export async function editRecipe(newRecipeData: Recipe) {
  try {
    const response = await economa_backend_api.put<Recipe>(`/recipes/${newRecipeData.id}`)
    return response.data
  }
  catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`An error has occur during update recipe ${newRecipeData.id}`)
      throw new Error(error.message || ' an error has occur')
    }
  }
  console.error(`An error has occur during update recipe ${newRecipeData.id}`)
}

export function createStock(newStock: StockCreation) {
  return useAxios<Stock>('/stocks', { method: 'POST', data: newStock }, economa_backend_api)
}

export function editStock(newStockData: Stock) {
  return useAxios<Stock>(`/stocks/${newStockData.id}`, { method: 'PUT', data: newStockData }, economa_backend_api)
}

export function removeStock(stockId: string) {
  return useAxios<void>(`/stocks/${stockId}`, { method: 'DELETE' }, economa_backend_api)
}

// export function getAllStocks(ingredientId: string) {
//   return useAxios<Stock[]>(`/stocks/byIngredient/${ingredientId}`, { method: 'GET' }, economa_backend_api)
// }

// ANCHOR -  use this form for the use of TanStackQuery
// the function must throw an error
export async function getAllStocksByIngredient(ingredientId: string): Promise<Stock[] | undefined> {
  try {
    const response = await economa_backend_api.get<Stock[]>(`/stocks/byIngredient/${ingredientId}`)
    return response.data
  }
  catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erreur lors de la création de l\'ingrédient:', error)

      throw new Error(error.message || 'une erreur est survenue')
    }
    console.error('Erreur lors de la création de l\'ingrédient:', error)
  }
}

export default economa_backend_api
