import { acceptHMRUpdate, defineStore } from 'pinia'
import { formatRFC3339, isValid, parse } from 'date-fns'
import type { StockCreation, Unit } from '~/types'

// this store is responsible to get information relative to ingredient creation

export const useCreateStockStore = defineStore('createStock', () => {
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
    return formatRFC3339(parsedDate)
  })

  const newStock = computed<StockCreation>(() => ({
    ingredientId: ingredientId.value,
    unit: newStockUnit.value,
    quantity: newStockQuantity.value,
    // this value must be in RFC3339 format
    expirationDate: newStockExpirationDate.value,
  }))

  // cannot add stock dynamicly in list here because is ingredient block that host
  // list of stocks
  async function addNewStock() {
    const stockData = await createStock(newStock.value)
    return stockData
  }

  function resetStockForm() {
    newStockUnit.value = 'kg'
    newStockQuantity.value = 0
    // this will automaticly update newExpirationDate
    expirationDateDisplayed.value = dateStore.todayFormated
  }

  return {
    ingredientId,
    newStock,
    expirationDateDisplayed,
    newStockQuantity,
    newStockUnit,
    resetStockForm,
    addNewStock,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useCreateStockStore as any, import.meta.hot))
