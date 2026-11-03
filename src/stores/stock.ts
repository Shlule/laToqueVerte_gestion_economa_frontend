import type { SupplierStock, SupplierStockCreation } from '~/types'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { parseISO } from 'date-fns'
import { acceptHMRUpdate, defineStore } from 'pinia'

export const useStockStore = defineStore('useStockStore', () => {
  const queryClient = useQueryClient()

  const { getIngredientCachedValue } = useIngredientStore()

  // use Stock and not Partial<Stock> to ensure to get id object
  const updateStock = useMutation({
    mutationFn: async ({ newStock }: { newStock: SupplierStock, ingredientId: string }) => {
      if (!newStock.id) {
        throw new Error('Cannor update stock without an id')
      }
      return editStock(newStock)
    },

    onMutate: async ({ newStock, ingredientId }: { newStock: SupplierStock, ingredientId: string }) => {
      await queryClient.cancelQueries({
        queryKey: ['stocks', ingredientId],
      })

      const previousStocks = queryClient.getQueryData<SupplierStock[]>(['stocks', ingredientId])

      if (previousStocks) {
        queryClient.setQueryData(['stocks', ingredientId], previousStocks.map(stock =>
          stock.id === newStock.id
            ? {
                ...stock,
                ...newStock,
              }
            : stock,
        ))
      }

      // TODO -  calculate the insufficient ingredient

      return { previousStocks, ingredientId }
    },

    onError: (err, variables, context) => {
      console.error('Mutation failed:', err)
      if (context?.previousStocks) {
        queryClient.setQueryData(['recipeIngredients', context.ingredientId], context.previousStocks)
      }
    },

    onSettled: (_, __, { ingredientId }) => {
      queryClient.invalidateQueries({
        queryKey: ['recipeIngredients', ingredientId],
      })
    },

  })

  const removeStock = useMutation({
    mutationFn: async ({ stockId }: { stockId: string, ingredientId: string }) => {
      return deleteStock(stockId)
    },

    onMutate: async ({ stockId, ingredientId }: { stockId: string, ingredientId: string }) => {
      await queryClient.cancelQueries({
        queryKey: ['stocks', ingredientId],
      })
      const previousStocks = queryClient.getQueryData<SupplierStock[]>(['stocks', ingredientId])

      if (previousStocks) {
        queryClient.setQueryData(['stocks', ingredientId], previousStocks.filter(stock => stock.id !== stockId))
      }

      return { previousStocks, ingredientId }
    },

    onError: (err, variables, context) => {
      console.error('Mutation failed', err)
      if (context?.previousStocks) {
        queryClient.setQueryData(['stocks', context.ingredientId], context.previousStocks)
      }
    },

    // refetch new Database, data
    onSettled: (_, __, { ingredientId }) => {
      queryClient.invalidateQueries({
        queryKey: ['recipeIngredients', ingredientId],
      })
    },
  })

  const addStock = useMutation({
    mutationFn: async ({ newStock }: { newStock: SupplierStockCreation, ingredientId: string }) => {
      return createStock(newStock)
    },

    onMutate: async ({ newStock, ingredientId }: { newStock: SupplierStockCreation, ingredientId: string }) => {
      await queryClient.cancelQueries({
        queryKey: ['stocks', ingredientId],
      })

      const previousStocks = queryClient.getQueryData<SupplierStock[]>(['stocks', ingredientId])
      const ingredient = getIngredientCachedValue(ingredientId)

      if (!ingredient) {
        throw new Error(`Impossible to retrieve Ingredient with this Id ${ingredientId}`)
      }

      const newStockobject: SupplierStock = {
        ...newStock,
        expirationDate: parseISO(newStock.expirationDate),
        ingredient,
        id: String(Date.now()),
      }

      if (previousStocks) {
        queryClient.setQueryData(['stocks', ingredientId], [...previousStocks, newStockobject])
      }

      return { previousStocks, ingredientId }
    },

    onError: (err, stock, context) => {
      console.error('Mutation failed', err)
      if (context?.previousStocks) {
        queryClient.setQueryData(['stocks', context.ingredientId], context.previousStocks)
      }
    },

    onSettled: (_, __, context) => {
      queryClient.invalidateQueries({
        queryKey: ['recipeIngredients', context.ingredientId],
      })
    },
  })

  return {

    updateStock,
    addStock,
    removeStock,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useStockStore as any, import.meta.hot))
