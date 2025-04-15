import type { AxiosRequestConfig } from 'axios'
import type { AddSubRecipe, AddToRecipe, Ingredient, IngredientCreation, InsufficientIngredient, InsufficientSubRecipe, Recipe, RecipeIngredient, Stock, StockCreation, SubRecipe } from '~/types'
import { useAxios } from '@vueuse/integrations/useAxios'
import axios from 'axios'

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

export async function createRecipeIngredient(newRecipeIngredientList: AddToRecipe[]) {
  try {
    const response = await economa_backend_api.post<RecipeIngredient[]>(`/recipe-ingredients`, newRecipeIngredientList)
    return response.data
  }
  catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`An error has occur during creating recipeIngredients `)
      throw new Error(error.message || ' an error has occur')
    }
  }
  console.error(`An error has occur during creating recipeIngredients`)
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

export async function getInsufficientIngredients(recipeId: string) {
  try {
    const response = await economa_backend_api.get<InsufficientIngredient[]>(`/recipes/${recipeId}/insufficientIngredients`)
    return response.data
  }
  catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`An error has occur during fetching insufficientIngredient of recipe of id ${recipeId}`)
      throw new Error(error.message)
    }
    console.error(`An error has occur during fetching insufficientIngredient of recipe of id ${recipeId}`)
  }
}

export async function createStock(newStock: StockCreation) {
  try {
    const response = await economa_backend_api.post<Stock>('/supplier-stocks', newStock)
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
    const response = await economa_backend_api.put<Stock>(`/supplier-stocks/${newStockData.id}`, newStockData)
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
    const response = await economa_backend_api.delete<Stock>(`/supplier-stocks/${stockId}`)
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

// ANCHOR -  use this form for the use of TanStackQuery
// the function must throw an error
export async function getAllStocksByIngredient(ingredientId: string): Promise<Stock[] | undefined> {
  try {
    const response = await economa_backend_api.get<Stock[]>(`/supplier-stocks/byIngredient/${ingredientId}`)
    return response.data
  }
  catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error during fetching all stocks with ingredient with ID ${ingredientId}:`, error)

      throw new Error(error.message || 'une erreur est survenue')
    }
    console.error(`Error during fetching all stocks with ingredient with ID ${ingredientId}:`, error)
  }
}

// testing new Form of creating Api with more Generic class

type HttpMethod = 'get' | 'post' | 'put' | 'delete'

interface ApiRequestParams<TData, TResponse> {
  method: HttpMethod
  url: string
  data?: TData
  errorContext?: string
  config?: AxiosRequestConfig<TResponse>

}

export async function apiRequest<TData, TResponse>(
  params: ApiRequestParams<TData, TResponse>,
): Promise<TResponse | undefined> {
  const { method, url, data, errorContext, config } = params

  try {
    const response = await economa_backend_api.request<TResponse>({
      method,
      url,
      data,
      ...config,
    })
    return response.data
  }
  catch (error) {
    const msg = `An error occurred${errorContext ? ` during ${errorContext}` : ''}`
    if (axios.isAxiosError(error))
      throw new Error(error.message || msg)
    throw new Error(msg)
  }
}

export async function editSubRecipe(newSubRecipe: SubRecipe): Promise<SubRecipe | undefined> {
  return apiRequest<SubRecipe, SubRecipe>({
    method: 'put',
    url: `/sub-recipes/${newSubRecipe.id}`,
    data: newSubRecipe,
    errorContext: `editing SubRecipe with ID ${newSubRecipe.id}`,
  })
}

export async function deleteSubRecipe(subRecipeId: string): Promise<void> {
  return apiRequest<undefined, void>({
    method: 'delete',
    url: `/sub-recipes/${subRecipeId}`,
    errorContext: `deleting subRecipe ${subRecipeId}`,
  })
}

export async function createSubRecipe(newSubRecipeList: AddSubRecipe[]): Promise<SubRecipe[] | undefined> {
  return apiRequest<AddSubRecipe[], SubRecipe[]>({
    method: 'post',
    url: `/sub-recipes`,
    data: newSubRecipeList,
    errorContext: ` adding SubRecipe `,
  })
}

export async function getAllSubRecipeByRecipe(recipeId: string): Promise<SubRecipe[] | undefined> {
  return apiRequest<string, SubRecipe[]>({
    method: 'get',
    url: `/sub-recipes/byParentRecipe/${recipeId}`,
    errorContext: `to get all subRecipe of Recipe with id ${recipeId}`,
  })
}

export async function getInsufficientSubRecipes(recipeId: string): Promise<InsufficientSubRecipe[] | undefined> {
  return apiRequest<string, InsufficientSubRecipe[]>({
    method: 'get',
    url: `/recipes/${recipeId}/insufficientSubRecipes`,
    errorContext: `to get all subRecipe of Recipe with id ${recipeId}`,
  })
}

export default economa_backend_api
