import { acceptHMRUpdate, defineStore } from 'pinia'
import type { Unit } from '~/types'

// this store is responsible to get information relative to ingredient creation

export const useCreateIngredientStore = defineStore('createIngredient', () => {
  const newIngredientName = ref('')
  const newIngredientUnit = ref<Unit>('kg')
  const newIngredientPrice = ref<number>(0)
  const newIngredientFournisseur = ref('')

  const newIngredient = computed(() => ({
    name: newIngredientName.value,
    unit: newIngredientUnit.value,
    price: newIngredientPrice.value,
    fournisseur: newIngredientFournisseur.value,
  }))

  function resetForm() {
    newIngredientName.value = ''
    newIngredientUnit.value = 'kg'
    newIngredientPrice.value = 0
    newIngredientFournisseur.value = ''
  }

  return {
    newIngredientName,
    newIngredient,
    newIngredientFournisseur,
    newIngredientPrice,
    newIngredientUnit,
    resetForm,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useCreateIngredientStore as any, import.meta.hot))
