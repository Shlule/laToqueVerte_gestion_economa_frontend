import { acceptHMRUpdate, defineStore } from 'pinia'
import type { Ingredient } from '~/types'

// this store is use to display all information relative to ingredient
// request data , sorting ingredient parameter
// the sorting of ingredient list are made here only in front end

export const useIngredientStore = defineStore('useIngredientStore', () => {
  const { data: allIngredient, error: ingredientError } = getAllIngredient()
  const { t } = useI18n()

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

  return {
    searchBarInput,
    ingredientList,
    sortOptions,
    sortSelected,
    ingredientError,
    isAscendantOrder,
    allIngredient,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useIngredientStore as any, import.meta.hot))
