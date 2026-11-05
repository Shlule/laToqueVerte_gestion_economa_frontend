<script setup lang="ts">
import type { Recipe } from '~/types'
import { useQuery } from '@tanstack/vue-query'
import { NTabPane, NTabs } from 'naive-ui'
import { getAllSubRecipeByRecipe, getInsufficientIngredients, getInsufficientSubRecipes } from '~/composables/apiService'
import { formatDuration } from '~/composables/cooking'
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
const [isProducing, toggleProducing] = useToggle()
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

// manques de stock, affichés directement sur la ligne concernée
function missingIngredient(ingredientId: string) {
  return insufficientRecipeIngredientQuery.data.value?.find(item => item.ingredientId === ingredientId)
}
function missingSubRecipe(childRecipeId: string) {
  return insufficientSubRecipeQuery.data.value?.find(item => item.childRecipeId === childRecipeId)
}
</script>

<template>
  <div grid w-full flex flex-col gap-2>
    <NCard :bordered="false" class="transition-all" flex rounded-2xl shadow-lg dark:ncard-dark hover:shadow-2xl>
      <div id="recipe-header" mb-2 text-left>
        <div flex items-center justify-between gap-3>
          <p min-w-0 truncate text-3xl :title="recipeData.name">
            {{ recipeData.name }}
          </p>
          <div flex shrink-0 items-center gap-1 :title="t('recipe-wizard.yield')">
            <p i-fluent:person-24-filled self-end />
            <p text-3xl>
              {{ Number(recipeData.quantity) }}
            </p>
            <span v-if="recipeData.unitType !== 'unit'" self-end text-sm>{{ recipeData.unitType }}</span>
          </div>
        </div>
        <div flex items-center justify-between gap-3 text-sm>
          <div flex items-center gap-1 opacity-80 :title="t('pricing.cooking')">
            <template v-if="recipeData.cookingTime">
              <span i-carbon-time />{{ formatDuration(recipeData.cookingTime) }}
              <template v-if="recipeData.cookingTemperature">
                <span i-carbon-temperature-hot ml-2 />{{ recipeData.cookingTemperature }} °C
              </template>
            </template>
          </div>
          <button icon-btn flex items-center gap-1 :title="t('produce.button')" @click="toggleProducing(true)">
            <span i-carbon-restaurant />{{ t('produce.button') }}
          </button>
        </div>
      </div>
      <NTabs v-model:value="activeTab" flex justify-content="space-evenly" type="segment">
        <NTabPane name="cost" :tab="t('recipe-tabInfo.tab_name')">
          <RecipeTabInfo :recipe-data="recipeData" />
        </NTabPane>

        <NTabPane name="ingredients" :tab="t('recipe-tabIngredients.tab_name')">
          <div id="RecipeIngredient-container">
            <NButton round @click="toggleAddingSomething()">
              {{ t('button.add_recipeingredient') }}
            </NButton>

            <HandleDisplay :query="recipeIngredientQuery">
              <NScrollbar max-h-16rem>
                <RecipeIngredientBlock v-for="recipeIngredient in recipeIngredientQuery.data.value" :key="recipeIngredient.id" :recipe-ingredient-data="recipeIngredient" :recipe-id="recipeData.id" :missing="missingIngredient(recipeIngredient.ingredient.id)" />
                <SubRecipeBlock v-for="subRecipe in subRecipeQuery.data.value" :key="subRecipe.id" :recipe-ingredient-data="subRecipe" :recipe-id="recipeData.id" :missing="missingSubRecipe(subRecipe.childRecipe.id)" />
              </NScrollbar>
            </HandleDisplay>
          </div>
        </NTabPane>

        <NTabPane name="stocks" :tab="t('produce.tab')">
          <RecipeTabStocks :recipe="recipeData" @produce="toggleProducing(true)" />
        </NTabPane>

        <NTabPane name="process" :tab="t('recipe-wizard.step_process')">
          <ol v-if="recipeData.steps?.length" list-decimal py-2 pl-6 text-left>
            <li v-for="(text, index) in recipeData.steps" :key="index" whitespace-pre-line py-1>
              {{ text }}
            </li>
          </ol>
          <p v-else py-4 opacity-60>
            {{ t('recipe-wizard.no_steps') }}
          </p>
        </NTabPane>
      </NTabs>
      <NModal v-model:show="isProducing">
        <ProduceRecipe :recipe="recipeData" @close="toggleProducing(false)" />
      </NModal>
      <NModal v-model:show="isAddingSomething" @after-leave="resetComponentsToAdd()">
        <AddingIngredientOrSubRecipe @toggle-adding-something-to-recipe="toggleAddingSomething()" />
      </NModal>
    </NCard>
  </div>
</template>

<style scoped>

</style>
