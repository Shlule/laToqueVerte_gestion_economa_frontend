import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { defineStore } from 'pinia'
import type { Recipe, Unit } from '~/types'

// this store is responsible to get information relative to ingredient creation

export const useRecipeStore = defineStore('recipeStore', () => {
  const { t } = useI18n()

  const queryClient = useQueryClient()

  const { data: allRecipe, error: recipeQueryError } = useQuery({
    queryKey: ['allRecipes'],
    queryFn: async () => {
      const response = await getAllRecipe()
      return response || []
    },
    // staleTime: 1000 * 60 * 5,
    // refetchOnWindowFocus: true,
  })

  const updateRecipeMutation = useMutation({
    mutationFn: async (updatedRecipe: Recipe) => {
      return editRecipe(updatedRecipe)
    },
    onMutate: async (updatedRecipe) => {
      await queryClient.cancelQueries({ queryKey: ['allRecipes'] })

      const previousRecipe = queryClient.getQueryData(['allRecipes'])

      queryClient.setQueryData(['allRecipes'], (oldRecipes: Recipe[]) => {
        return oldRecipes.map(recipe =>
          recipe.id === updatedRecipe.id ? { ...recipe, ...updatedRecipe } : recipe,
        )
      })
      return { previousRecipe }
    },
    onError: (err, updatedRecipe, context) => {
      console.error('Erreur', err.message)
      queryClient.setQueryData(['allRecipes'], context?.previousRecipe)
    },

  })

  function getRecipeCachedValue(recipeId: string) {
    if (!allRecipe.value) {
      return
    }
    return allRecipe.value.find(recipe => recipe.id === recipeId)
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

  const recipeOptionSelected = ref<string>(t('recipe-option.number_of_piece'))
  const recipeOptions = computed(() => [{
    label: t('recipe-option.number_of_piece'),
    value: t('recipe-option.number_of_piece'),
  },
  ])

  return {
    recipeOptions,
    recipeOptionSelected,
    recipeUnit,
    nbOfPiece,
    recipeQueryError,
    updateRecipeMutation,
    sortOptions,
    recipeList,
    sortSelected,
    isAscendantOrder,
    searchBarInput,
    getRecipeCachedValue,
  }
})
