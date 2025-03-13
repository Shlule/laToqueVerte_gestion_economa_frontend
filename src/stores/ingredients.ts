import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { acceptHMRUpdate, defineStore } from 'pinia'
import type { Ingredient, IngredientCreation, Unit } from '~/types'

// this store is use to display all information relative to ingredient
// request data , sorting ingredient parameter
// the sorting of ingredient list are made here only in front end

export const useIngredientStore = defineStore('useIngredientStore', () => {
  const queryClient = useQueryClient()
  // const { data: allIngredient, error: ingredientQueryError, isLoading: ingredientQueryLoading } = getAllIngredient()
  const { data: allIngredient, error: ingredientQueryError, isLoading: ingredientQueryLoading, isSuccess: IngredientQuerySuccess } = useQuery({
    queryKey: ['allIngredients'],
    queryFn: async () => {
      const response = await getAllIngredient()
      return response || []
    },
    staleTime: 1000 * 60 * 5,
  })

  const { t } = useI18n()

  function getIngredientCachedValue(ingredientId: string) {
    if (!allIngredient.value) {
      return
    }
    return allIngredient.value.find(ingredient => ingredient.id === ingredientId)
  }

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

  const updateIngredient = useMutation({
    mutationFn: async (updatedIngredient: Ingredient) => {
      if (!updatedIngredient.id) {
        throw new Error('cannot Update ingredient without an Id')
      }
      return editIngredient(updatedIngredient)
    },

    onMutate: async (updatedIngredient: Ingredient) => {
      await queryClient.cancelQueries({ queryKey: ['allIngredients'] })

      const previousIngredients = queryClient.getQueryData<Ingredient[]>(['allIngredients'])
      queryClient.setQueryData(['allIngredients'], (oldIngredients: Ingredient[]) => {
        return oldIngredients.map(ingredient => ingredient.id === updatedIngredient.id ? { ...ingredient, ...updatedIngredient } : ingredient)
      })
      return { previousIngredients }
    },

    onError: (err, updatedIngredient, context) => {
      console.error(err.message)
      queryClient.setQueryData(['allIngredients'], context?.previousIngredients)
    },

    onSuccess(data, updatedIngredient) {
      queryClient.setQueryData(['allIngredients'], (oldIngredients: Ingredient[]) => {
        return oldIngredients.map(ingredient => ingredient.id === updatedIngredient.id ? { ...ingredient, ...updatedIngredient } : ingredient)
      })
    },
  })

  const addIngredient = useMutation({
    mutationFn: async (newIngredient: IngredientCreation) => {
      return createIngredient(newIngredient)
    },

    onMutate: async (newIngredient: IngredientCreation) => {
      await queryClient.cancelQueries({ queryKey: ['allIngredients'] })

      const previousIngredients = queryClient.getQueryData<Ingredient[]>(['allIngredients'])

      // create a pseudo Ingredient object
      const tempId = String(Date.now())
      const optimisticIngredient = { ...newIngredient, id: tempId }

      if (previousIngredients) {
        queryClient.setQueryData(['allIngredients'], [...previousIngredients, optimisticIngredient])
      }
      return { previousIngredients, tempId }
    },

    onError: (err, newIngredient, context) => {
      console.error('Mutation Failed', err.message)
      queryClient.setQueryData(['allIngredients'], context?.previousIngredients)
    },

    onSuccess: (data, newIngredient, context) => {
      queryClient.setQueryData(['allIngredients'], (oldIngredients: Ingredient[]) => {
        return oldIngredients.map(ingredient =>
          ingredient.id === context.tempId ? data : ingredient,
        )
      })
      queryClient.invalidateQueries({ queryKey: ['allRecipes'] })
    },
  })

  const newIngredientName = ref('')
  const newIngredientUnit = ref<Unit>('kg')
  const newIngredientPrice = ref<number>(0)
  const newIngredientFournisseur = ref('')

  const newIngredient = computed<IngredientCreation>(() => ({
    name: newIngredientName.value,
    unitType: newIngredientUnit.value,
    pricePerUnit: newIngredientPrice.value,
    fournisseur: newIngredientFournisseur.value,
  }))

  // async function addNewIngredient() {
  //   const ingredientData = await createIngredient(newIngredient.value)

  //   if (!ingredientData || !ingredientStore.allIngredient) {
  //     return
  //   }
  //   // use spread operator to keep reactivity
  //   // @todo do it with push and keep reactivity
  //   ingredientStore.allIngredient = [...ingredientStore.allIngredient, ingredientData.data]
  // }
  async function addNewIngredient() {
    addIngredient.mutate(newIngredient.value)
  }

  // function updateIngredient(id: string, updatedData: Ingredient) {
  //   if (!allIngredient.value) {
  //     return
  //   }
  //   const index = allIngredient.value.findIndex(ingredient => ingredient.id === id)

  //   if (index === -1) {
  //     console.error(`Ingredient with id ${id} not found`)
  //   }

  //   // update ingredient
  //   // TODO - try to find an other method and keep reactivity
  //   allIngredient.value[index] = { ...allIngredient.value[index], ...updatedData }
  //   allIngredient.value = [...allIngredient.value]
  //   // allIngredient.value.splice(index, 1, { ...allIngredient.value[index], ...updatedData })
  // }

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
    ingredientQueryError,
    ingredientQueryLoading,
    IngredientQuerySuccess,
    isAscendantOrder,
    allIngredient,
    newIngredientName,
    newIngredient,
    newIngredientFournisseur,
    newIngredientPrice,
    newIngredientUnit,
    addIngredient,
    resetIngredientForm,
    addNewIngredient,
    updateIngredient,
    getIngredientCachedValue,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useIngredientStore as any, import.meta.hot))
