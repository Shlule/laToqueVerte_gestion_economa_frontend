import axios from 'axios'
import { useAxios } from '@vueuse/integrations/useAxios'
import type { Ingredient, IngredientCreation, Recipe, Stock } from '~/types'

const economa_backend_api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// here useAxios does not provide response correctly
// impossible to access value with useAxios
export async function createIngredientBackend(newIngredient: IngredientCreation) {
  try {
    const response = await economa_backend_api.post<Ingredient>('/ingredients', newIngredient)
    return response
  }
  catch (error) {
    console.error('Erreur lors de la création de l\'ingrédient:', error)
  }
}

export function getAllIngredient() {
  return useAxios<Ingredient[]>('/ingredients', { method: 'GET' }, economa_backend_api)
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

export default economa_backend_api
