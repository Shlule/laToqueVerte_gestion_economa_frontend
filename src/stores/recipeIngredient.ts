import type { QueryClient } from '@tanstack/vue-query'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { defineStore } from 'pinia'
import { deleteRecipeIngredient } from '~/composables/apiService'
import type { AddToRecipe, Ingredient, Recipe, RecipeIngredient } from '~/types'

// this store is responsible to get information relative to ingredient creation

export const useRecipeIngredientStore = defineStore('RecipeIngredient', () => {
  const queryClient = useQueryClient()
  const { getRecipeLocal } = useRecipeStore()

  // this function is a helper function to update Recipes Cache
  // we using it for all CRUD action of recipeIngredients
  function updateRecipeCache(queryClient: QueryClient, recipeId: string) {
    queryClient.cancelQueries({ queryKey: ['allRecipes'] })

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

  // this function is for updating RecipeIngredients, and the Recipe Associated to that RecipeIngredient
  // because RecipeCost is associated to the quantity , unit and cost of a RecipeIngredient
  const updateRecipeIngredient = useMutation({

    // recipeId Parameter is necessary because all recipeIngredients of Recipe are fetching
    // by tanStackQuery  with querykey ['recipeIngredient',recipeId]
    mutationFn: async ({ recipeIngredient }: { recipeIngredient: RecipeIngredient }) => {
      if (!recipeIngredient.id) {
        throw new Error('Cannot update recipeIngredient without an ID')
      }
      return editRecipeIngredient(recipeIngredient)
    },

    onMutate: async ({ recipeIngredient, recipeId }: { recipeIngredient: RecipeIngredient, recipeId: string }) => {
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
    mutationFn: async ({ recipeIngredientId }: { recipeIngredientId: string }) => {
      return deleteRecipeIngredient(recipeIngredientId)
    },
    onMutate: async ({ recipeIngredientId, recipeId }: { recipeIngredientId: string, recipeId: string }) => {
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
    mutationFn: async ({ recipeIngredient }: { recipeIngredient: AddToRecipe }) => {
      return createRecipeIngredient(recipeIngredient)
    },

    onMutate: async ({ recipeIngredient, ingredient }: { recipeIngredient: AddToRecipe, ingredient: Ingredient }) => {
      await queryClient.cancelQueries({ queryKey: ['recipeIngredients', recipeIngredient.recipeId] })

      // update recipeIngredientList , of the recipeIngredients query key
      // adding a new recipeIngredient
      const previousRecipeIngredientList = queryClient.getQueryData<RecipeIngredient[]>(['recipeIngredients', recipeIngredient.recipeId])

      // create a full RecipeIngredient object from addToRecipe
      // first retrieve the recipe
      const recipe = getRecipeLocal(recipeIngredient.recipeId)
      // next retrieve the ingredient, it is already in the request for simplicity and
      // optimization

      // finish to calculate cost

      const ingredientUnit = ingredient.unitType
      const convertedQuantity = convertUnit(recipeIngredient.quantityNeeded, recipeIngredient.unit, ingredientUnit)
      const cost = Number((ingredient.pricePerUnit * convertedQuantity).toFixed(2))

      if (!recipe) {
        throw new Error(`impossible to retrieve Recipe with this id ${recipeIngredient.recipeId}`)
      }
      const newRecipeIngredient: RecipeIngredient = {
        recipe,
        ingredient,
        cost,
        unit: recipeIngredient.unit,
        quantityNeeded: recipeIngredient.quantityNeeded,
        id: String(Date.now()),

      }

      if (previousRecipeIngredientList) {
        queryClient.setQueryData(['recipeIngredients', recipeIngredient.recipeId], [...previousRecipeIngredientList, newRecipeIngredient])
      }

      // update the concerned Recipe
      const { previousRecipes } = updateRecipeCache(queryClient, recipeIngredient.recipeId)
      return { previousRecipeIngredientList, previousRecipes, recipeId: recipeIngredient.recipeId }
    },

    onError: (err, recipeIngredient, context) => {
      console.error('Mutation failed:', err)
      if (context?.previousRecipeIngredientList) {
        queryClient.setQueryData(['recipeIngredients', context.recipeId], context.previousRecipeIngredientList)
      }
      if (context?.previousRecipes) {
        queryClient.setQueryData(['allRecipes'], context.previousRecipes)
      }
    },

    onSettled: (_, __, context) => {
      queryClient.invalidateQueries({ queryKey: ['recipeIngredients', context.recipeIngredient.recipeId] })
    },
  })

  return {

    updateRecipeIngredient,
    removeRecipeIngredient,
    addRecipeIngredient,
  }
})
