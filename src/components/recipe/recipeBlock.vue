<script setup lang="ts">
import type { Recipe } from '~/types'
import { useQuery } from '@tanstack/vue-query'
import { NTabPane, NTabs } from 'naive-ui'
import { getAllSubRecipeByRecipe, getInsufficientIngredients, getInsufficientSubRecipes } from '~/composables/apiService'
import RecipeIngredientBlock from '../recipe_ingredient/recipeIngredientBlock.vue'

const recipeData = defineModel<Recipe>('recipeData', { required: true })

const { t } = useI18n()
const [isAddingSomething, toggleAddingSomething] = useToggle()

const { resetRecipeIngredientToAdd } = useRecipeIngredientStore()
const { resetSubRecipeToAdd } = useSubRecipeStore()

function resetComponentsToAdd() {
  resetRecipeIngredientToAdd()
  resetSubRecipeToAdd()
}

const activeTab = ref<string>('cost')
provide('recipeId', recipeData.value.id)

// SECTION -  do this for tan stack query only accept ref  for enabled prop
const isIngredientTab = ref<boolean>(false)
watch(
  () => activeTab.value,
  (newTab) => {
    isIngredientTab.value = newTab === 'ingredients'
  },
)
// !SECTION

// const { data: recipeIngredientList, error: recipeIngredientQueryError, isLoading: recipeIngredientQueryLoading } = useQuery({
//   queryKey: ['recipeIngredients', recipeData.value.id],
//   queryFn: async () => {
//     const response = await getAllRecipeIngredientByRecipe(recipeData.value.id)
//     if (!response) {
//       return
//     }
//     // recipeIngredientStore.setRecipeIngredients(recipeData.value.id, response)
//     return response
//   },
//   enabled: isIngredientTab,
// })

const recipeIngredientQuery = useQuery({
  queryKey: ['recipeIngredients', recipeData.value.id],
  queryFn: async () => {
    const response = await getAllRecipeIngredientByRecipe(recipeData.value.id)
    if (!response) {
      return
    }
    // recipeIngredientStore.setRecipeIngredients(recipeData.value.id, response)
    return response
  },
  enabled: isIngredientTab,
})

const subRecipeQuery = useQuery({
  queryKey: ['subRecipes', recipeData.value.id],
  queryFn: async () => {
    const response = await getAllSubRecipeByRecipe(recipeData.value.id)
    if (!response) {
      return
    }
    // recipeIngredientStore.setRecipeIngredients(recipeData.value.id, response)
    return response
  },
  enabled: isIngredientTab,
})

const insufficientRecipeIngredientQuery = useQuery({
  queryKey: ['insufficientIngredients', recipeData.value.id],
  queryFn: async () => {
    const response = await getInsufficientIngredients(recipeData.value.id)
    if (!response) {
      return
    }
    return response
  },
  enabled: isIngredientTab,
})

const insufficientSubRecipeQuery = useQuery({
  queryKey: ['insufficientSubRecipes', recipeData.value.id],
  queryFn: async () => {
    const response = await getInsufficientSubRecipes(recipeData.value.id)
    if (!response) {
      return
    }
    return response
  },
  enabled: isIngredientTab,
})
</script>

<template>
  <div grid w-full flex flex-col gap-2>
    <NCard :bordered="false" class="transition-all" flex rounded-2xl shadow-lg dark:ncard-dark hover:shadow-2xl>
      <div id="recipe-header" flex items-center justify-between>
        <div flex gap-2>
          <p text-3xl>
            {{ recipeData.name }}
          </p>
        </div>
        <div flex gap-2>
          <p i-fluent:person-24-filled self-end />
          <p text-3xl>
            {{ recipeData.quantity }}
          </p>
        </div>
      </div>
      <NTabs v-model:value="activeTab" flex justify-content="space-evenly" type="segment">
        <NTabPane name="cost" :tab="t('recipe-tabInfo.tab_name')">
          <RecipeTabInfo :recipe-data="recipeData" />
        </NTabPane>

        <NTabPane name="ingredients" :tab="t('recipe-tabIngredients.tab_name')">
          <HandleDisplay :query="insufficientRecipeIngredientQuery">
            <NScrollbar max-h-16rem>
              <InsufficientIngredientBlock v-for="insufficientIngredient in insufficientRecipeIngredientQuery.data.value" :key="insufficientIngredient.name" :insufficient-ingredient-data="insufficientIngredient" />
              <InsufficientSubRecipeBlock v-for="insufficientSubRecipe in insufficientSubRecipeQuery.data.value" :key="insufficientSubRecipe.name" :insufficient-sub-recipe-data="insufficientSubRecipe" />
            </NScrollbar>
          </HandleDisplay>
          <div id="RecipeIngredient-container">
            <NButton round @click="toggleAddingSomething()">
              {{ t('button.add_recipeingredient') }}
            </NButton>

            <HandleDisplay :query="recipeIngredientQuery">
              <NScrollbar max-h-16rem>
                <RecipeIngredientBlock v-for="recipeIngredient in recipeIngredientQuery.data.value" :key="recipeIngredient.id" :recipe-ingredient-data="recipeIngredient" :recipe-id="recipeData.id" />
                <SubRecipeBlock v-for="subRecipe in subRecipeQuery.data.value" :key="subRecipe.id" :recipe-ingredient-data="subRecipe" :recipe-id="recipeData.id" />
              </NScrollbar>
            </HandleDisplay>
          </div>
        </NTabPane>

        <NTabPane name="stocks" />
      </NTabs>
      <NModal v-model:show="isAddingSomething" @after-leave="resetComponentsToAdd()">
        <AddingIngredientOrSubRecipe @toggle-adding-something-to-recipe="toggleAddingSomething()" />
      </NModal>
    </NCard>
  </div>
</template>

<style scoped>

</style>
