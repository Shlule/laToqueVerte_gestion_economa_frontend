import { acceptHMRUpdate, defineStore } from 'pinia'
import { createIngredientBackend } from '~/composables/apiService'
import type { IngredientCreation, Unit } from '~/types'

// this store is responsible to get information relative to ingredient creation

export const useCreateIngredientStore = defineStore('createIngredient', () => {
  const newIngredientName = ref('')
  const newIngredientUnit = ref<Unit>('kg')
  const newIngredientPrice = ref<number>(0)
  const newIngredientFournisseur = ref('')

  const { ingredientList } = useIngredientStore()

  const newIngredient = computed<IngredientCreation>(() => ({
    name: newIngredientName.value,
    unitType: newIngredientUnit.value,
    pricePerUnit: newIngredientPrice.value,
    fournisseur: newIngredientFournisseur.value,
  }))

  async function createIngredient() {
    const ingredientData = await createIngredientBackend(newIngredient.value)

    if (!ingredientList || !ingredientData) {
      return
    }
    ingredientList.push(ingredientData.data)
  }

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
    createIngredient,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useCreateIngredientStore as any, import.meta.hot))
