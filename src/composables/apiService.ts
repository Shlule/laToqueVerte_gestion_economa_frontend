import axios from 'axios'
import { useAxios } from '@vueuse/integrations/useAxios'
import type { Ingredient, Recipe, Stock } from '~/types'

const economa_backend_api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export function getAllIngredient() {
  return useAxios<Ingredient[]>('/ingredients', { method: 'GET' }, economa_backend_api)
}

export function getAllRecipe() {
  return useAxios<Recipe[]>('/recipes', { method: 'GET' }, economa_backend_api)
}

export function createRecipe() {
  return useAxios<Recipe>('/recipes', { method: 'POST' }, economa_backend_api)
}

export function getAllStocks(params?: string) {
  return useAxios<Stock[]>('/stocks/byIngredient/', { method: 'GET', params }, economa_backend_api)
}

export default economa_backend_api
