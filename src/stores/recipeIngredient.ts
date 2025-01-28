import { defineStore } from 'pinia'
import type { RecipeIngredient } from '~/types'

// this store is responsible to get information relative to ingredient creation

export const useRecipeIngredientStore = defineStore('RecipeIngredient', () => {
  const recipeIngredientPerRecipe = ref<Map<string, RecipeIngredient[]>>(new Map())

  function hasRecipeIngredients(recipeId: string): boolean {
    return recipeIngredientPerRecipe.value.has(recipeId)
  }

  function getRecipeIngredients(recipeId: string): RecipeIngredient[] | undefined {
    return recipeIngredientPerRecipe.value.get(recipeId)
  }

  function setRecipeIngredients(recipeId: string, recipeIngredient: RecipeIngredient[]) {
    recipeIngredientPerRecipe.value.set(recipeId, recipeIngredient)
  }

  function editRecipeIngredientLocal(recipeId: string, recipeIngredientId: string, newRecipeIngredient: RecipeIngredient) {
    const recipeIngredientData = getRecipeIngredients(recipeId)?.find(recipeIngredient => recipeIngredient.id === recipeIngredientId)
    if (!recipeIngredientData) {
      return
    }

    // TODO - find an other way to get reactivity and change object entirely not just the properties
    recipeIngredientData.quantityNeeded = newRecipeIngredient.quantityNeeded
    recipeIngredientData.unit = newRecipeIngredient.unit
  }

  return {
    recipeIngredientPerRecipe,
    hasRecipeIngredients,
    getRecipeIngredients,
    setRecipeIngredients,
    editRecipeIngredientLocal,
  }
})
