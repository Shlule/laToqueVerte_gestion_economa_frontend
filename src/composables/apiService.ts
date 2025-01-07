import axios from 'axios'
import { useAxios } from '@vueuse/integrations/useAxios'
import type { Ingredient, IngredientCreation, Recipe, Stock, StockCreation } from '~/types'

const economa_backend_api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// here useAxios does not provide response correctly
// impossible to access value with useAxios because return undefined value
export async function createIngredient(newIngredient: IngredientCreation) {
  try {
    const response = await economa_backend_api.post<Ingredient>('/ingredients', newIngredient)
    return response
  }
  catch (error) {
    console.error('Erreur lors de la création de l\'ingrédient:', error)
    return error
  }
}

export function createStock(newStock: StockCreation) {
  return useAxios<Stock[]>('/stocks', { method: 'POST', data: newStock }, economa_backend_api)
}

export function editStock(newStockData: Stock) {
  return useAxios<Stock>(`/stocks/${newStockData.id}`, { method: 'PUT', data: newStockData }, economa_backend_api)
}

export function getAllIngredient() {
  return useAxios<Ingredient[]>('/ingredients', { method: 'GET' }, economa_backend_api)
}

export function editIngredient(newIngredientData: Ingredient) {
  return useAxios<Ingredient>(`/ingredients/${newIngredientData.id}`, { method: 'PUT', data: newIngredientData }, economa_backend_api)
}

export function getAllRecipe() {
  return useAxios<Recipe[]>('/recipes', { method: 'GET' }, economa_backend_api)
}

export function createRecipe() {
  return useAxios<Recipe>('/recipes', { method: 'POST' }, economa_backend_api)
}

export function getAllStocks(ingredientId: string) {
  return useAxios<Stock[]>(`/stocks/byIngredient/${ingredientId}`, { method: 'GET' }, economa_backend_api)
}

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
