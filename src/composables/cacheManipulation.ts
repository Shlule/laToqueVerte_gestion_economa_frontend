// this function is a helper function to update Recipes Cache

import type { QueryClient } from '@tanstack/vue-query'
import type { Recipe, RecipeIngredient } from '~/types'

// we using it for all CRUD action of recipeIngredients
export function updateRecipeCache(queryClient: QueryClient, recipeId: string) {
  queryClient.cancelQueries({
    queryKey: ['allRecipes'],
  })

  // get the value of recipeIngredients to update the recipe
  const updatedRecipeIngredients = queryClient.getQueryData<RecipeIngredient[]>(['recipeIngredients', recipeId])
  const previousRecipes = queryClient.getQueryData<Recipe[]>(['allRecipes'])

  if (previousRecipes) {
    queryClient.setQueryData(['allRecipes'], previousRecipes.map(recipe =>
      recipe.id === recipeId
        ? {
            ...recipe,
            recipeIngredients: updatedRecipeIngredients,
            cost: Number.parseFloat(
              (updatedRecipeIngredients?.reduce((total, ri) => total + Number(ri.cost), 0) ?? recipe.cost).toFixed(2),
            ),
          }
        : recipe,
    ))
  }
  // return previous value  for rollback if needed
  return { previousRecipes }
}
