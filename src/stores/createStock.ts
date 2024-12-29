import { acceptHMRUpdate, defineStore } from 'pinia'
import { formatISO, isValid, parse } from 'date-fns'
import type { StockCreation, Unit } from '~/types'

// this store is responsible to get information relative to ingredient creation

export const useCreateStockStore = defineStore('createStock', () => {
  const dateStore = useDateStore()

  const ingredientId = ref<string>('')
  const newStockUnit = ref<Unit>('kg')
  const newStockQuantity = ref<number>(0)
  const expirationDateDisplayed = ref<string>(dateStore.todayFormated)

  const unitOptions = [{
    label: 'kg',
    value: 'kg',
  }, {
    label: 'g',
    value: 'g',
  }, {
    label: 'unit',
    value: 'unit',
  }]

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

  // cannot add stock dynamically in list here like ingredient
  //  because is ingredient block that host list of stocks
  // this function must await create stock to get non undefined value
  async function addNewStock() {
    return await createStock(newStock.value)
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
    unitOptions,
    newStockExpirationDate,
    expirationDateDisplayed,
    newStockQuantity,
    newStockUnit,
    resetStockForm,
    addNewStock,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useCreateStockStore as any, import.meta.hot))
