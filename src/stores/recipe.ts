import { acceptHMRUpdate, defineStore } from 'pinia'
import type { Recipe, Unit } from '~/types'

// this store is responsible to get information relative to ingredient creation

export const useRecipeStore = defineStore('recipeStore', () => {
  const { t } = useI18n()

  const { data: allRecipe, error: recipeQueryError } = getAllRecipe()

  // const { data: allRecipe, error: recipeQuerryError } = useQuery({
  //   queryKey: ['recipes'],
  //   queryFn: async () => {
  //     const response = await getAllRecipe()
  //     if (!response) {
  //       return
  //     }
  //     // const allRecipeMap = new Map(response.map(recipe => [recipe.id, recipe]))
  //     return response
  //   },
  // })

  // ANCHOR - transform  map into array for sorting and searching method
  // const allRecipe = computed(() => {
  //   if (!allRecipeMap.value) {
  //     return
  //   }
  //   return [...allRecipeMap.value.values()]
  // })

  // function hasRecipeLocal(recipeId: string): boolean {
  //   if (!allRecipeMap.value) {
  //     return false
  //   }
  //   return allRecipeMap.value.has(recipeId)
  // }

  // function getRecipeLocal(recipeId: string): Recipe | undefined {
  //   if (!allRecipeMap.value) {
  //     return
  //   }
  //   return allRecipeMap.value.get(recipeId)
  // }

  // function setRecipeLocal(recipe: Recipe) {
  //   if (!allRecipeMap.value) {
  //     return
  //   }
  //   allRecipeMap.value.set(recipe.id, recipe)
  // }

  // this function is use to refetch and update data of a specific recipe
  // inside allRecipeMap because allRecipeMap is our source of truth
  async function updateRecipeLocal(recipeId: string) {
    if (!allRecipe.value) {
      return
    }
    // request api to get new data
    const { data: newRecipeData } = await getRecipe(recipeId)
    if (!newRecipeData.value) {
      return
    }

    const oldRecipeData = allRecipe.value.find(recipe => recipe.id === recipeId)
    if (!oldRecipeData) {
      return
    }

    // TODO - find a better solution to that
    oldRecipeData.cost = newRecipeData.value.cost
    oldRecipeData.recipeIngredients = newRecipeData.value.recipeIngredients
    oldRecipeData.name = newRecipeData.value.name
    oldRecipeData.numberOfPieces = newRecipeData.value.numberOfPieces
    oldRecipeData.insufficientIngredients = newRecipeData.value.insufficientIngredients
    // allRecipeMap.value.set(recipeId, newRecipeData.value)
  }

  const sortSelected = ref<string>(t('ingredient.sort_option.alphabetical'))
  const searchBarInput = ref('')
  const isAscendantOrder = ref<boolean>(true)

  // use computed to keep reactivity on I18n
  const sortOptions = computed(() => [{
    label: t('recipe.sort_option.alphabetical'),
    key: t('recipe.sort_option.alphabetical'),
  }, {
    label: t('recipe.sort_option.cost'),
    key: t('recipe.sort_option.cost'),
  }])

  const sortKey = computed(() => {
    switch (sortSelected.value) {
      case t('recipe.sort_option.alphabetical'):
        return 'name'
      case t('ingredient.sort_option.price'):
        return 'cost'

      default:
        return 'name'
    }
  })

  // key parameter has only key of ingredient interface as type
  function sortRecipesBy<K extends keyof Recipe>(array: Recipe[], key: K, isAscendentOrder: boolean = true): Ingredient[] {
    return array.slice().sort((a, b) => {
      const valueA = a[key]
      const valueB = b[key]

      if (key === 'cost') {
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

  const recipeList = computed(() => {
    if (!allRecipe.value) {
      return
    }
    const filteredIngredientList = allRecipe.value.filter((recipe: Recipe) => {
      return recipe.name.toLocaleLowerCase().includes(searchBarInput.value.toLowerCase())
    })
    return sortRecipesBy(filteredIngredientList, sortKey.value, isAscendantOrder.value)
  })

  const recipeUnit = ref<Unit>('kg')
  const nbOfPiece = ref<number>()
  const weight = ref<number>()

  const recipeOptionSelected = ref<string>(t('recipe-option.number_of_piece'))
  const recipeOptions = computed(() => [{
    label: t('recipe-option.number_of_piece'),
    value: t('recipe-option.number_of_piece'),
  }, {
    label: t('recipe-option.weight'),
    value: t('recipe-option.weight'),
  }])

  return {
    recipeOptions,
    recipeOptionSelected,
    recipeUnit,
    nbOfPiece,
    recipeQueryError,
    weight,
    sortOptions,
    recipeList,
    sortSelected,
    isAscendantOrder,
    searchBarInput,
    updateRecipeLocal,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useRecipeStore as any, import.meta.hot))
