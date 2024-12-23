import { acceptHMRUpdate, defineStore } from 'pinia'
import { createIngredient } from '~/composables/apiService'
import type { IngredientCreation, Unit } from '~/types'

// this store is responsible to get information relative to ingredient creation

export const useCreateIngredientStore = defineStore('createIngredient', () => {
  const newIngredientName = ref('')
  const newIngredientUnit = ref<Unit>('kg')
  const newIngredientPrice = ref<number>(0)
  const newIngredientFournisseur = ref('')

  const ingredientStore = useIngredientStore()

  const newIngredient = computed<IngredientCreation>(() => ({
    name: newIngredientName.value,
    unitType: newIngredientUnit.value,
    pricePerUnit: newIngredientPrice.value,
    fournisseur: newIngredientFournisseur.value,
  }))

  async function addNewIngredient() {
    const ingredientData = await createIngredient(newIngredient.value)

    if (!ingredientData || !ingredientStore.allIngredient) {
      return
    }
    // use spread operator to keep reactivity
    // @todo do it with push and keep reactivity
    ingredientStore.allIngredient = [...ingredientStore.allIngredient, ingredientData.data]
  }

  function resetIngredientForm() {
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
    resetIngredientForm,
    addNewIngredient,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useCreateIngredientStore as any, import.meta.hot))
