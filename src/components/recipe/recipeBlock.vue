<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { NSpin, NTabPane, NTabs } from 'naive-ui'
import RecipeIngredientBlock from '../recipe_ingredient/recipeIngredientBlock.vue'
import type { Recipe } from '~/types'

const recipeData = defineModel<Recipe>('recipeData', { required: true })

const { t } = useI18n()
const [isAddingRecipeIngredient, toggleAddingRecipeIngredient] = useToggle()

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

const { data: recipeIngredientList, error: recipeIngredientQueryError, isLoading: recipeIngredientQueryLoading } = useQuery({
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

const isNoRecipeIngredient = computed(() => {
  if (recipeIngredientList.value?.length === 0) {
    return true
  }
  else {
    return false
  }
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
            {{ recipeData.numberOfPieces }}
          </p>
        </div>
      </div>
      <NTabs v-model:value="activeTab" flex justify-content="space-evenly" type="segment">
        <NTabPane name="cost" :tab="t('recipe-tabInfo.tab_name')">
          <RecipeTabInfo :recipe-data="recipeData" />
        </NTabPane>
        <NTabPane name="ingredients" :tab="t('recipe-tabIngredients.tab_name')">
          <NButton round @click="toggleAddingRecipeIngredient()">
            {{ t('button.add_recipeingredient') }}
          </NButton>
          <div v-if="isNoRecipeIngredient" text-6>
            {{ t('stock-header.no_stock') }}
          </div>
          <div v-else-if="recipeIngredientQueryError">
            {{ recipeIngredientQueryError }}
          </div>
          <div v-else-if="recipeIngredientQueryLoading" flex>
            <p> {{ t('loading.query') }}</p>
            <NSpin />
          </div>
          <div v-else>
            {{ recipeData.insufficientIngredient }}
            <NScrollbar>
              <RecipeIngredientBlock v-for="recipeIngredient in recipeIngredientList" :key="recipeIngredient.id" :recipe-ingredient-data="recipeIngredient" :recipe-id="recipeData.id" />
            </NScrollbar>
          </div>
          <div v-if="isAddingRecipeIngredient" />
        </NTabPane>
      </NTabs>
    </NCard>
    <NModal v-model:show="isAddingRecipeIngredient">
      <RecipeIngredientCreate :recipe-id="recipeData.id" />
    </NModal>
  </div>
</template>

<style scoped>

</style>
