import type { QueryClient } from '@tanstack/vue-query'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { defineStore } from 'pinia'
import type { Recipe, RecipeIngredient } from '~/types'

// this store is responsible to get information relative to ingredient creation

export const useRecipeIngredientStore = defineStore('RecipeIngredient', () => {
  const queryClient = useQueryClient()

  // this function is a helper function to update Recipes Cache
  // we using it for all CRUD action of recipeIngredients
  function updateRecipeCache(queryClient: QueryClient, recipeId: string) {
    queryClient.cancelQueries({ queryKey: ['recipes'] })

    const updatedRecipeIngredients = queryClient.getQueryData<RecipeIngredient[]>(['recipeIngredients', recipeId])

    const previousRecipes = queryClient.getQueryData<Recipe[]>(['recipes'])

    if (previousRecipes) {
      queryClient.setQueryData(['recipes'], previousRecipes.map(recipe =>
        recipe.id === recipeId
          ? {
              ...recipe,
              recipeIngredients: updatedRecipeIngredients,
              cost: updatedRecipeIngredients?.reduce((total, ri) => total + ri.cost, 0) ?? recipe.cost, // 🔥 Recalcul du coût
            }
          : recipe,
      ))
    }
    // return previous value  for rollback if needed
    return { previousRecipes }
  }

  // this function is for updating RecipeIngredients, and the Recipe Associated to that RecipeIngredient
  // because RecipeCost is associated to the quantity , unit and cost of a RecipeIngredient
  const updateRecipeIngredient = useMutation({

    // recipeId Parameter is necessary because all recipeIngredients of Recipe are fetching
    // by tanStackQuery  with querykey ['recipeIngredient',recipeId]
    mutationFn: async ({ recipeIngredient }: { recipeIngredient: RecipeIngredient, recipeId: string }) => {
      if (!recipeIngredient.id) {
        throw new Error('Cannot update recipeIngredient without an ID')
      }
      return editRecipeIngredient(recipeIngredient)
    },

    onMutate: async ({ recipeIngredient, recipeId }) => {
      // work on recipeIngredient update
      await queryClient.cancelQueries({ queryKey: ['recipeIngredients', recipeId] })

      const previousRecipeIngredients = queryClient.getQueryData<RecipeIngredient[]>(['recipeIngredients', recipeId])

      if (previousRecipeIngredients) {
        queryClient.setQueryData(['recipeIngredients', recipeId], previousRecipeIngredients.map(ri =>
          ri.id === recipeIngredient.id ? { ...ri, ...recipeIngredient } : ri,
        ))
      }

      // must update  associated recipe
      const { previousRecipes } = updateRecipeCache(queryClient, recipeId)
      return { previousRecipeIngredients, previousRecipes, recipeId }
    },
    // doing rollback on error
    onError: (err, variables, context) => {
      console.error('Mutation failed:', err)
      if (context?.previousRecipeIngredients) {
        queryClient.setQueryData(['recipeIngredients', context.recipeId], context.previousRecipeIngredients)
      }
      if (context?.previousRecipes) {
        queryClient.setQueryData(['recipes'], context.previousRecipes)
      }
    },
    // refetch new Database, data
    onSettled: (_, __, { recipeId }) => {
      queryClient.invalidateQueries({ queryKey: ['recipeIngredients', recipeId] })
    },
  })

  return {

    updateRecipeIngredient,
  }
})
