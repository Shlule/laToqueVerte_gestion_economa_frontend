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

  //   async function addNewStock() {
  //     const ingredientData = await createIngredient(newIngredient.value)

  //     if (!ingredientData || !ingredientStore.allIngredient) {
  //       return
  //     }
  //     // use spread operator to keep reactivity
  //     // @todo do it with push and keep reactivity
  //     ingredientStore.allIngredient = [...ingredientStore.allIngredient, ingredientData.data]
  //   }

  function resetForm() {
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
    resetForm,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useCreateStockStore as any, import.meta.hot))
