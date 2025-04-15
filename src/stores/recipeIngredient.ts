import type { AddToRecipe, RecipeIngredient } from '~/types'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { defineStore } from 'pinia'
import { deleteRecipeIngredient } from '~/composables/apiService'
import { updateRecipeCache } from '~/composables/cacheManipulation'

// this store is responsible to get information relative to ingredient creation

export const useRecipeIngredientStore = defineStore('RecipeIngredient', () => {
  const queryClient = useQueryClient()
  const { getRecipeCachedValue } = useRecipeStore()

  // this function is for updating recipeIngredients and the associated parentRecipe
  // for updating the cost field of ParentRecipe
  const updateRecipeIngredient = useMutation({

    // use RecipeIngredient and not Partial for ensure to get id object
    mutationFn: async ({ recipeIngredient }: { recipeIngredient: RecipeIngredient }) => {
      if (!recipeIngredient.id) {
        throw new Error('Cannot update recipeIngredient without an ID')
      }
      return editRecipeIngredient(recipeIngredient)
    },

    // recipeId Parameter is necessary because all recipeIngredients of Recipe are fetching
    // by tanStackQuery  with querykey ['recipeIngredient',recipeId]
    onMutate: async ({ recipeIngredient, recipeId }: { recipeIngredient: RecipeIngredient, recipeId: string }) => {
      // work on recipeIngredient update
      await queryClient.cancelQueries({ queryKey: ['recipeIngredients', recipeId] })

      const previousRecipeIngredients = queryClient.getQueryData<RecipeIngredient[]>(['recipeIngredients', recipeId])

      if (previousRecipeIngredients) {
        // filter the corresponding recipeIngredient inside the cache
        queryClient.setQueryData(['recipeIngredients', recipeId], previousRecipeIngredients.map(ri =>
          ri.id === recipeIngredient.id ? { ...ri, ...recipeIngredient } : ri,
        ))
      }

      // must update  associated recipe
      const { previousRecipes } = await updateRecipeCache(queryClient, recipeId)

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
      queryClient.invalidateQueries({ queryKey: ['insufficientIngredients', recipeId] })
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
      queryClient.invalidateQueries({ queryKey: ['insufficientIngredients', recipeId] })
    },
  })

  const addRecipeIngredients = useMutation({
    mutationFn: async ({ recipeIngredientList }: { recipeIngredientList: AddToRecipe[] }) => {
      return createRecipeIngredient(recipeIngredientList)
    },

    onMutate: async ({ recipeIngredientList }: { recipeIngredientList: AddToRecipe[] }) => {
      // we assume that all addToRecipe object must be add to the same recipe
      const recipeId = recipeIngredientList[0].recipeId
      await queryClient.cancelQueries({ queryKey: ['recipeIngredients', recipeId] })

      // update recipeIngredientList , of the recipeIngredients query key
      // adding a new recipeIngredient
      const previousRecipeIngredientList = queryClient.getQueryData<RecipeIngredient[]>(['recipeIngredients', recipeId])

      // create a full RecipeIngredient object from addToRecipe
      // first retrieve the recipe
      const recipe = getRecipeCachedValue(recipeId)
      // next retrieve the ingredient, it is already in the request for simplicity and
      // optimization

      if (!recipe) {
        throw new Error(`impossible to retrieve Recipe with this id ${recipeId}`)
      }
      const newRecipeIngredientList: RecipeIngredient[] = recipeIngredientList.map((recipeIngredient) => {
        // we do this to calculate the cost for each recipeIngredient we must create
        const ingredient = recipeIngredient.ingredient
        const ingredientUnit = ingredient.unitType
        const convertedQuantity = convertUnit(recipeIngredient.quantityNeeded, recipeIngredient.unit, ingredientUnit)
        const cost = Number((ingredient.pricePerUnit * convertedQuantity).toFixed(2))

        // finaly create th RecipeIngredient Object
        return {
          recipe,
          ingredient,
          cost,
          unit: recipeIngredient.unit,
          quantityNeeded: recipeIngredient.quantityNeeded,
          id: String(Date.now()), // On génère un ID temporaire pour l'optimistic update
        }
      })

      // update manualy the cache
      if (previousRecipeIngredientList) {
        queryClient.setQueryData(['recipeIngredients', recipeId], [...previousRecipeIngredientList, ...newRecipeIngredientList])
      }

      // update the concerned Recipe
      const { previousRecipes } = updateRecipeCache(queryClient, recipeId)
      return { previousRecipeIngredientList, previousRecipes, recipeId }
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
      queryClient.invalidateQueries({ queryKey: ['recipeIngredients', context.recipeIngredientList[0].recipeId] })
      queryClient.invalidateQueries({ queryKey: ['insufficientIngredients', context.recipeIngredientList[0].recipeId] })
    },
  })

  const recipeIngredientListToAdd = ref<AddToRecipe[]>([])

  function addRecipeIngredientToList(addToRecipe: AddToRecipe) {
    recipeIngredientListToAdd.value.push(addToRecipe)
  }

  function deleteRecipeIngredientToList(index: number) {
    recipeIngredientListToAdd.value.splice(index)
  }

  function resetRecipeIngredientToAdd() {
    recipeIngredientListToAdd.value = []
  }

  function addRecipeIngredientBackend() {
    addRecipeIngredients.mutate({ recipeIngredientList: recipeIngredientListToAdd.value })
  }

  return {
    recipeIngredientListToAdd,
    updateRecipeIngredient,
    removeRecipeIngredient,
    addRecipeIngredientBackend,
    addRecipeIngredientToList,
    deleteRecipeIngredientToList,
    resetRecipeIngredientToAdd,
  }
})
