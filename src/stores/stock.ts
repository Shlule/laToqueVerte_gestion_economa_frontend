import type { Stock, StockCreation } from '~/types'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { acceptHMRUpdate, defineStore } from 'pinia'

export const useStockStore = defineStore('useStockStore', () => {
  const queryClient = useQueryClient()

  const { getIngredientCachedValue } = useIngredientStore()

  // use Stock and not Partial<Stock> to ensure to get id object
  const updateStock = useMutation({
    mutationFn: async ({ newStock }: { newStock: Stock }) => {
      if (!newStock.id) {
        throw new Error('Cannor update stock without an id')
      }
      return editStock(newStock)
    },

    onMutate: async ({ newStock, ingredientId }: { newStock: Stock, ingredientId: string }) => {
      await queryClient.cancelQueries({ queryKey: ['stocks', ingredientId] })

      const previousStocks = queryClient.getQueryData<Stock[]>(['stocks', ingredientId])

      if (previousStocks) {
        queryClient.setQueryData(['stocks', ingredientId], previousStocks.map(stock =>
          stock.id === newStock.id ? { ...stock, ...newStock } : stock,
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
      queryClient.invalidateQueries({ queryKey: ['recipeIngredients', ingredientId] })
    },

  })

  const removeStock = useMutation({
    mutationFn: async ({ stockId }: { stockId: string }) => {
      return deleteStock(stockId)
    },

    onMutate: async ({ stockId, ingredientId }: { stockId: string, ingredientId: string }) => {
      await queryClient.cancelQueries({ queryKey: ['stocks', ingredientId] })
      const previousStocks = queryClient.getQueryData<Stock[]>(['stocks', ingredientId])

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
      queryClient.invalidateQueries({ queryKey: ['recipeIngredients', ingredientId] })
    },
  })

  const addStock = useMutation({
    mutationFn: async ({ newStock }: { newStock: StockCreation }) => {
      return createStock(newStock)
    },

    onMutate: async ({ newStock, ingredientId }: { newStock: StockCreation, ingredientId: string }) => {
      await queryClient.cancelQueries({ queryKey: ['stocks', ingredientId] })

      const previousStocks = queryClient.getQueryData<Stock[]>(['stocks', ingredientId])
      const ingredient = getIngredientCachedValue(ingredientId)

      if (!ingredient) {
        throw new Error(`Impossible to retrieve Ingredient with this Id ${ingredientId}`)
      }
      const newStockobject: Stock = {
        ...newStock,
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
      queryClient.invalidateQueries({ queryKey: ['recipeIngredients', context.ingredientId] })
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
