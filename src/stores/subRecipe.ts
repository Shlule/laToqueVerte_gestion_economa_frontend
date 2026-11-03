import type { AddSubRecipe, SubRecipe } from '~/types'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { createSubRecipe, deleteSubRecipe, editSubRecipe } from '~/composables/apiService'
import { updateRecipeCache } from '~/composables/cacheManipulation'

export const useSubRecipeStore = defineStore('SubRecipe', () => {
  const queryclient = useQueryClient()
  const { getRecipeCachedValue } = useRecipeStore()

  // this function is for updating SubRecipes and the associated parentRecipe
  // for updating the cost field of ParentRecipe
  const updateSubRecipe = useMutation({

    // use SubRecipe and not Partial<SubRecipe> for ensuring to get id object
    mutationFn: async ({ subRecipe }: { subRecipe: SubRecipe, recipeId: string }) => {
      if (!subRecipe.id) {
        throw new Error ('Cannot update subRecipe without an ID')
      }
      return editSubRecipe(subRecipe)
    },

    onMutate: async ({ subRecipe, recipeId }: { subRecipe: SubRecipe, recipeId: string }) => {
      await queryclient.cancelQueries({
        queryKey: ['subRecipes', recipeId],
      })

      const previousSubRecipes = queryclient.getQueryData<SubRecipe[]>(['subRecipes', recipeId])
      if (previousSubRecipes) {
        queryclient.setQueryData(['subRecipes', recipeId], previousSubRecipes.map(sub =>
          sub.id === subRecipe.id
            ? {
                ...sub,
                ...subRecipe,
              }
            : sub,
        ))
      }

      // update the associated parent Recipe of SubRecipe
      const { previousRecipes } = await updateRecipeCache(queryclient, recipeId)
      return { previousSubRecipes, previousRecipes, recipeId }
    },

    // doing rollback on error
    onError: (err, variables, context) => {
      console.error('Mutation failed:', err)
      if (context?.previousSubRecipes) {
        queryclient.setQueryData(['subRecipes', context.recipeId], context.previousSubRecipes)
      }
      if (context?.previousRecipes) {
        queryclient.setQueryData(['allRecipe'], context.previousRecipes)
      }
    },

    onSettled: (_, __, { recipeId }) => {
      queryclient.invalidateQueries({
        queryKey: ['subRecipes', recipeId],
      })
      queryclient.invalidateQueries({
        queryKey: ['insufficientSubRecipes', recipeId],
      })
    },

  })

  const removeSubRecipe = useMutation({
    mutationFn: async ({ subRecipeId }: { subRecipeId: string, recipeId: string }) => {
      return deleteSubRecipe(subRecipeId)
    },

    onMutate: async ({ subRecipeId, recipeId }: { subRecipeId: string, recipeId: string }) => {
      await queryclient.cancelQueries({
        queryKey: ['subRecipes', recipeId],
      })
      const previousSubRecipes = queryclient.getQueryData<SubRecipe[]>(['subRecipes', recipeId])

      if (previousSubRecipes) {
        queryclient.setQueryData(['subRecipes', recipeId], previousSubRecipes.filter(sub => sub.id !== subRecipeId))
      }

      const { previousRecipes } = updateRecipeCache(queryclient, recipeId)

      return { previousRecipes, previousSubRecipes, recipeId }
    },

    onError: (err, variables, context) => {
      console.error('Mutation failed', err)

      if (context?.previousSubRecipes) {
        queryclient.setQueryData(['subRecipes', context.recipeId], context.previousSubRecipes)
      }
      if (context?.previousRecipes) {
        queryclient.setQueryData(['subRecipes', context.recipeId], context.previousRecipes)
      }
    },

    onSettled: (_, __, { recipeId }) => {
      queryclient.invalidateQueries({
        queryKey: ['subRecipes', recipeId],
      })
      queryclient.invalidateQueries({
        queryKey: ['insufficientSubRecipes', recipeId],
      })
    },

  })

  const addSubRecipes = useMutation({
    mutationFn: async ({ subRecipeList }: { subRecipeList: AddSubRecipe[] }) => {
      return createSubRecipe(subRecipeList)
    },

    onMutate: async ({ subRecipeList }: { subRecipeList: AddSubRecipe[] }) => {
      // we assume that all subRecipe in newRecipeList must be add to the same parentRecipe
      const recipeId = subRecipeList[0].parentRecipeId
      await queryclient.cancelQueries({
        queryKey: ['subRecipes', recipeId],
      })

      const previousSubRecipes = queryclient.getQueryData<SubRecipe[]>(['subRecipes', recipeId])

      const recipe = getRecipeCachedValue(recipeId)
      if (!recipe) {
        throw new Error(`impossible to retrieve Recipe with Id ${recipeId}`)
      }
      const newSubRecipeList: SubRecipe[] = subRecipeList.map((subRecipe) => {
        const childRecipe = subRecipe.childRecipe
        const childRecipeUnit = subRecipe.childRecipe.unitType
        const convertedQuantity = convertUnit(subRecipe.quantityNeeded, subRecipe.unit, childRecipeUnit)

        const ratio = Number(childRecipe.cost / childRecipe.quantity)
        const cost = Number((ratio * convertedQuantity).toFixed(2))

        return {
          quantityNeeded: subRecipe.quantityNeeded,
          unit: subRecipe.unit,
          cost,
          childRecipe,
          parentRecipe: recipe,
          id: String(Date.now()),

        }
      })

      if (previousSubRecipes) {
        queryclient.setQueryData(['subRecipes', recipeId], [
          ...previousSubRecipes,
          ...newSubRecipeList,
        ])
      }

      const { previousRecipes } = updateRecipeCache(queryclient, recipeId)
      return { previousSubRecipes, previousRecipes, recipeId }
    },

    onError: (err, subRecipe, context) => {
      console.error('Mutation failed:', err)
      if (context?.previousSubRecipes) {
        queryclient.setQueryData(['subRecipes', context.recipeId], context.previousSubRecipes)
      }
      if (context?.previousRecipes) {
        queryclient.setQueryData(['subRecipes', context.recipeId], context.previousRecipes)
      }
    },

    onSettled: (_, __, ___, context) => {
      queryclient.invalidateQueries({
        queryKey: ['subRecipes', context?.recipeId],
      })
      queryclient.invalidateQueries({
        queryKey: ['insufficientSubRecipes', context?.recipeId],
      })
    },
  })

  const subRecipeListToAdd = ref<AddSubRecipe[]>([])

  function addSubRecipeToList(addSubRecipe: AddSubRecipe) {
    subRecipeListToAdd.value.push(addSubRecipe)
  }

  function deleteSubRecipeToList(index: number) {
    subRecipeListToAdd.value.splice(index)
  }

  function resetSubRecipeToAdd() {
    subRecipeListToAdd.value = []
  }

  function addSubRecipeBackend() {
    addSubRecipes.mutate({ subRecipeList: subRecipeListToAdd.value })
  }

  return {
    subRecipeListToAdd,
    updateSubRecipe,
    removeSubRecipe,
    addSubRecipeBackend,
    addSubRecipeToList,
    deleteSubRecipeToList,
    resetSubRecipeToAdd,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useSubRecipeStore as any, import.meta.hot))
