import axios from 'axios'
import { useAxios } from '@vueuse/integrations/useAxios'
import type { AddToRecipe, Ingredient, IngredientCreation, Recipe, RecipeIngredient, Stock, StockCreation } from '~/types'

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

export async function deleteRecipeIngredient(recipeIngredientId: string) {
  try {
    const response = await economa_backend_api.delete<void>(`/recipe-ingredients/${recipeIngredientId}`)
    return response.data
  }
  catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`An error has occur during delete recipeIngredient ${recipeIngredientId}`)
      throw new Error(error.message || ' an error has occur')
    }
  }
  console.error(`An error has occur during delete recipeIngredient ${recipeIngredientId}`)
}

export async function createRecipeIngredient(newRecipeIngredient: AddToRecipe) {
  try {
    const response = await economa_backend_api.post<RecipeIngredient>(`/recipe-ingredients`, newRecipeIngredient)
    return response.data
  }
  catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`An error has occur during creating recipeIngredient `)
      throw new Error(error.message || ' an error has occur')
    }
  }
  console.error(`An error has occur during creating recipeIngredient`)
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
    return response.data
  }
  catch (error) {
    console.error('An error has occur during creating ingredient ', error)
    return error
  }
}

export function removeIngredient(ingredientId: string) {
  return useAxios<void>(`/ingredients/${ingredientId}`, { method: 'DELETE' }, economa_backend_api)
}

export async function getAllIngredient(): Promise<Ingredient[] | undefined> {
  try {
    const response = await economa_backend_api.get<Ingredient[]>('/ingredients')
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
export async function editIngredient(newIngredientData: Ingredient) {
  try {
    const response = await economa_backend_api.put<Ingredient>(`/ingredients/${newIngredientData.id}`, newIngredientData)
    return response.data
  }
  catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`An error has occur during editing ingredients ${newIngredientData.id}`)
      throw new Error(error.message)
    }
    console.error(`An error has occur during editing ingredients ${newIngredientData.id}`)
  };
}

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

export async function getRecipe(recipeId: string) {
  try {
    const response = await economa_backend_api.get<Recipe>(`/recipes/${recipeId}`)
    return response.data
  }
  catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`An error has occur during fetching recipe with Id ${recipeId} `)
      throw new Error(error.message)
    }
    console.error(`An error has occur during fetching recipe with Id ${recipeId} `)
  }
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
      console.error(`An error has occur during update recipe with Id ${newRecipeData.id}`)
      throw new Error(error.message || ' an error has occur')
    }
  }
  console.error(`An error has occur during update recipe with Id ${newRecipeData.id}`)
}

export async function createStock(newStock: StockCreation) {
  try {
    const response = await economa_backend_api.post<Stock>('/stocks', newStock)
    return response.data
  }
  catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('An error has occur during stock creation')
      throw new Error(error.message)
    }
    console.error('An error has occur during stock creation')
  }
}

export async function editStock(newStockData: Stock) {
  try {
    const response = await economa_backend_api.put<Stock>(`/stocks/${newStockData.id}`, newStockData)
    return response.data
  }
  catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`An error has occur during update stock with Id ${newStockData.id}`)
      throw new Error(error.message)
    }
    console.error(`An error has occur during update stock with Id ${newStockData.id}`)
  }
}

export async function deleteStock(stockId: string) {
  try {
    const response = await economa_backend_api.delete<Stock>(`/stocks/${stockId}`)
    return response.data
  }
  catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`An error has occur during delete stock with Id ${stockId}`)
      throw new Error(error.message)
    }
    console.error(`An error has occur during delete stock with Id ${stockId}`)
  }
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
