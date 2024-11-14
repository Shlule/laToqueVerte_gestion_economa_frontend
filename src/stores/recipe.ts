import { acceptHMRUpdate, defineStore } from 'pinia'

export const useCreateRecipeStore = defineStore('createRecipe', () => {
  const recipeTitle = ref<string>('New recipe')

  return { recipeTitle }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useCreateRecipeStore, import.meta.hot))
