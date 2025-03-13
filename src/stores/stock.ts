import { acceptHMRUpdate, defineStore } from 'pinia'
import { formatISO, isValid, parse } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Stock, StockCreation, Unit } from '~/types'

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

  const stockPerIngredient = ref<Map<string, Stock[]>>(new Map())

  function hasStocks(ingredientId: string): boolean {
    return stockPerIngredient.value.has(ingredientId)
  }

  function getStocks(ingredientId: string): Stock[] | undefined {
    return stockPerIngredient.value.get(ingredientId)
  }

  function setStocks(ingredientId: string, stocks: Stock[]) {
    stockPerIngredient.value.set(ingredientId, stocks)
  }

  function editStockLocal(ingredientId: string, stockId: string, newStockData: Stock) {
    const stockData = getStocks(ingredientId)?.find(stock => stock.id === stockId)
    if (!stockData) {
      return
    }

    // TODO - find an other way to get reactivity and change object entirely not just the properties
    stockData.quantity = newStockData.quantity
    stockData.unit = newStockData.unit
    stockData.expirationDate = newStockData.expirationDate
  }

  const dateStore = useDateStore()
  const ingredientId = ref<string>('')
  const newStockUnit = ref<Unit>('kg')
  const newStockQuantity = ref<number>(0)
  const expirationDateDisplayed = ref<string>(dateStore.todayFormated)

  const newStockExpirationDate = computed(() => {
    const parsedDate = parse(expirationDateDisplayed.value, dateStore.dayFormat, new Date())
    if (isValid(parsedDate) === false) {
      throw new Error('Invalid date format. Expected format: dd/MM/yyyy')
    }
    return formatISO(parsedDate)
  })

  const newStock = computed<StockCreation>(() => ({
    ingredient: ingredientId.value,
    unit: newStockUnit.value,
    quantity: newStockQuantity.value,
    // this value must be in ISO format
    expirationDate: newStockExpirationDate.value,
  }))

  // async function addNewStock(ingredientId: string) {
  //   const { data: responseStock, error } = await createStock(newStock.value)
  //   if (error.value) {
  //     console.error(`request to create stock failed ${error}`)
  //     return { responseStock, error }
  //   }
  //   if (!responseStock.value) {
  //     return { responseStock, error }
  //   }
  //   stockPerIngredient.value.get(ingredientId)?.push(responseStock.value)

  //   return { responseStock, error }
  // }

  function resetStockForm() {
    newStockUnit.value = 'kg'
    newStockQuantity.value = 0
    // this will automaticly update newExpirationDate
    expirationDateDisplayed.value = dateStore.todayFormated
  }
  return {
    stockPerIngredient,
    hasStocks,
    getStocks,
    setStocks,
    resetStockForm,
    newStock,
    expirationDateDisplayed,
    newStockQuantity,
    newStockUnit,
    newStockExpirationDate,
    ingredientId,
    editStockLocal,
    updateStock,
    addStock,
    removeStock,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useStockStore as any, import.meta.hot))
