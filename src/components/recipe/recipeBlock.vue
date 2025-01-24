<script setup lang="ts">
import { NTabPane, NTabs } from 'naive-ui'
import type { Recipe } from '~/types'

const recipeData = defineModel<Recipe>('recipeData', { required: true })

const { t } = useI18n()

const activeTab = ref<string>('cost')
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
          <p i-fluent:person-24-filled self-end>
            {{ t('recipe-tabInfo.nbof_pieces') }}
          </p>
          <p text-3xl>
            {{ recipeData.numberOfPieces }}
          </p>
        </div>
      </div>
      <NTabs v-model:value="activeTab" placement="bottom" flex justify-content="space-evenly">
        <NTabPane name="cost" :label="t('recipe-tabInfo.tab_name')">
          <RecipeTabInfo :recipe-data="recipeData" />
        </NTabPane>
        <NTabPane name="ingredients" :label="t('recipe-tabIngredients.tab_name')" />
      </NTabs>
    </NCard>
  </div>
</template>

<style scoped>

</style>
