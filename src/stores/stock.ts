import { acceptHMRUpdate, defineStore } from 'pinia'
import { formatISO, isValid, parse } from 'date-fns'
import type { Stock, StockCreation, Unit } from '~/types'

export const useStockStore = defineStore('useStockStore', () => {
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

  async function addNewStock(ingredientId: string) {
    const { data: responseStock, error } = await createStock(newStock.value)
    if (error.value) {
      console.error(`request to create stock failed ${error}`)
      return { responseStock, error }
    }
    if (!responseStock.value) {
      return { responseStock, error }
    }
    stockPerIngredient.value.get(ingredientId)?.push(responseStock.value)

    return { responseStock, error }
  }

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
    addNewStock,
    ingredientId,
    editStockLocal,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useStockStore as any, import.meta.hot))
