import { acceptHMRUpdate, defineStore } from 'pinia'
import type { Ingredient, IngredientCreation, Unit } from '~/types'

// this store is use to display all information relative to ingredient
// request data , sorting ingredient parameter
// the sorting of ingredient list are made here only in front end

export const useIngredientStore = defineStore('useIngredientStore', () => {
  const { data: allIngredient, error: ingredientQuerryError } = getAllIngredient()

  const { t } = useI18n()

  // ANCHOR - all this part is for text display and ingredient display and sorting
  const sortSelected = ref<string>(t('ingredient.sort_option.alphabetical'))
  const searchBarInput = ref('')
  const isAscendantOrder = ref<boolean>(true)

  // use computed to keep reactivity on I18n
  const sortOptions = computed(() => [{
    label: t('ingredient.sort_option.alphabetical'),
    key: t('ingredient.sort_option.alphabetical'),
  }, {
    label: t('ingredient.sort_option.price'),
    key: t('ingredient.sort_option.price'),
  }, {
    label: t('ingredient.sort_option.supplier'),
    key: t('ingredient.sort_option.supplier'),
  }])

  const sortKey = computed(() => {
    switch (sortSelected.value) {
      case t('ingredient.sort_option.alphabetical'):
        return 'name'
      case t('ingredient.sort_option.price'):
        return 'pricePerUnit'
      case t('ingredient.sort_option.supplier'):
        return 'fournisseur'
      default:
        return 'name'
    }
  })

  // key parameter has only key of ingredient interface as type
  function sortIngredientsBy<K extends keyof Ingredient>(array: Ingredient[], key: K, isAscendentOrder: boolean = true): Ingredient[] {
    return array.slice().sort((a, b) => {
      const valueA = a[key]
      const valueB = b[key]

      if (key === 'pricePerUnit') {
        const numberA = Number(valueA)
        const numberB = Number(valueB)

        return isAscendentOrder ? numberA - numberB : numberB - numberA
      }

      if (valueA == null || valueB == null) {
        return 0
      }

      if (valueA === valueB) {
        return 0
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return isAscendentOrder
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA)
      }
      return 0
    })
  }

  const ingredientList = computed(() => {
    if (!allIngredient.value) {
      return
    }
    const filteredIngredientList = allIngredient.value.filter((ingredient: Ingredient) => {
      return ingredient.name.toLocaleLowerCase().includes(searchBarInput.value.toLowerCase())
    })
    return sortIngredientsBy(filteredIngredientList, sortKey.value, isAscendantOrder.value)
  })

  // ANCHOR - ingredient manipulation such as edit create and delete

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

  function updateIngredient(id: string, updatedData: Ingredient) {
    if (!allIngredient.value) {
      return
    }
    const index = allIngredient.value.findIndex(ingredient => ingredient.id === id)

    if (index === -1) {
      console.error(`Ingredient with id ${id} not found`)
    }

    // update ingredient
    // TODO - try to find an other method and keep reactivity
    allIngredient.value[index] = { ...allIngredient.value[index], ...updatedData }
    allIngredient.value = [...allIngredient.value]
    // allIngredient.value.splice(index, 1, { ...allIngredient.value[index], ...updatedData })
  }

  function resetIngredientForm() {
    newIngredientName.value = ''
    newIngredientUnit.value = 'kg'
    newIngredientPrice.value = 0
    newIngredientFournisseur.value = ''
  }

  return {
    searchBarInput,
    ingredientList,
    sortOptions,
    sortSelected,
    ingredientQuerryError,
    isAscendantOrder,
    allIngredient,
    newIngredientName,
    newIngredient,
    newIngredientFournisseur,
    newIngredientPrice,
    newIngredientUnit,
    resetIngredientForm,
    addNewIngredient,
    updateIngredient,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useIngredientStore as any, import.meta.hot))
