import type { QueryClient } from '@tanstack/vue-query'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { defineStore } from 'pinia'
import { deleteRecipeIngredient } from '~/composables/apiService'
import type { AddToRecipe, Recipe, RecipeIngredient } from '~/types'

// this store is responsible to get information relative to ingredient creation

export const useRecipeIngredientStore = defineStore('RecipeIngredient', () => {
  const queryClient = useQueryClient()

  // this function is a helper function to update Recipes Cache
  // we using it for all CRUD action of recipeIngredients
  function updateRecipeCache(queryClient: QueryClient, recipeId: string) {
    queryClient.cancelQueries({ queryKey: ['allRecipes'] })

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
        queryClient.setQueryData(['allRecipes'], context.previousRecipes)
      }
    },
    // refetch new Database, data
    onSettled: (_, __, { recipeId }) => {
      queryClient.invalidateQueries({ queryKey: ['recipeIngredients', recipeId] })
    },
  })

  const removeRecipeIngredient = useMutation({
    mutationFn: async ({ recipeIngredientId }: { recipeIngredientId: string, recipeId: string }) => {
      return deleteRecipeIngredient(recipeIngredientId)
    },
    onMutate: async ({ recipeIngredientId, recipeId }) => {
      // delete the recipeIngredient in recipeIngredientlist
      await queryClient.cancelQueries({ queryKey: ['recipeIngredients', recipeId] })
      const previousRecipeIngredientList = queryClient.getQueryData<RecipeIngredient[]>(['recipeIngredients', recipeId])

      if (previousRecipeIngredientList) {
        queryClient.setQueryData(['recipeIngredients', recipeId], previousRecipeIngredientList.filter(ri => ri.id !== recipeIngredientId))
      }

      const { previousRecipes } = updateRecipeCache(queryClient, recipeId)

      return { previousRecipeIngredientList, previousRecipes, recipeId }
    },

    onError: (err, variables, context) => {
      console.error('Mutation failed:', err)
      if (context?.previousRecipeIngredientList) {
        queryClient.setQueryData(['recipeIngredients', context.recipeId], context.previousRecipeIngredientList)
      }
      if (context?.previousRecipes) {
        queryClient.setQueryData(['allRecipes'], context.previousRecipes)
      }
    },
    // refetch new Database, data
    onSettled: (_, __, { recipeId }) => {
      queryClient.invalidateQueries({ queryKey: ['recipeIngredients', recipeId] })
    },
  })

  const addRecipeIngredient = useMutation({
    mutationFn: async (recipeIngredient: AddToRecipe) => {
      return createRecipeIngredient(recipeIngredient)
    },

    onMutate: async (recipeIngredient) => {
      await queryClient.cancelQueries({ queryKey: ['recipeIngredients', recipeIngredient.recipeId] })

      // update recipeIngredientList , of the recipeIngredients query key
      // adding a new recipeIngredient
      const previousRecipeIngredientList = queryClient.getQueryData<RecipeIngredient[]>(['recipeIngredients', recipeIngredient.recipeId])
      if (previousRecipeIngredientList) {
        queryClient.setQueryData(['recipeIngredients', recipeIngredient.recipeId], [...previousRecipeIngredientList, { ...recipeIngredient, cost: 3 }])
      }

      // update the concerned Recipe
      const { previousRecipes } = updateRecipeCache(queryClient, recipeIngredient.recipeId)
      return { previousRecipeIngredientList, previousRecipes }
    },

    onError: (err, recipeIngredient, context) => {
      console.error('Mutation failed:', err)
      if (context?.previousRecipeIngredientList) {
        queryClient.setQueryData(['recipeIngredients', recipeIngredient.recipeId], context.previousRecipeIngredientList)
      }
      if (context?.previousRecipes) {
        queryClient.setQueryData(['allRecipes'], context.previousRecipes)
      }
    },

    onSettled: (_, __, { recipeId }) => {
      queryClient.invalidateQueries({ queryKey: ['recipeIngredients', recipeId] })
    },
  })

  return {

    updateRecipeIngredient,
    removeRecipeIngredient,
    addRecipeIngredient,
  }
})
