import { acceptHMRUpdate, defineStore } from 'pinia'
import type { Unit } from '~/types'

// this store is responsible to get information relative to ingredient creation

export const useRecipeStore = defineStore('recipeStore', () => {
  const { t } = useI18n()

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
    weight,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useRecipeStore as any, import.meta.hot))
