<script setup lang="ts">
import { NInput } from 'naive-ui'
import RecipeCreate from './recipeCreate.vue'

const { t } = useI18n()
const recipeStore = useRecipeStore()
const [isCreateNewRecipe, toggleCreateNewRecipe] = useToggle()

function handleSelect(key: string) {
  recipeStore.sortSelected = key
}

function swapOrder() {
  recipeStore.isAscendantOrder = !recipeStore.isAscendantOrder
}
</script>

<template>
  <div id="ingredient-header-container" flex items-center justify-between gap-4>
    <div m-l-10 flex shrink-0 text-16>
      {{ t('recipe-header.title') }}
    </div>
    <NInput v-model:value="recipeStore.searchBarInput" :placeholder="t('recipe-header.search_bar')" type="text" round flex>
      <template #prefix>
        <div i-fluent:search-20-filled text-4 />
      </template>
    </NInput>
    <div id="button-menu" m-r-12 flex gap-4>
      <NButton circle @click="swapOrder()">
        <div i-fluent:arrow-sort-20-regular />
      </NButton>
      <div />
      <NDropdown trigger="hover" :options="recipeStore.sortOptions" @select="handleSelect">
        <NButton>
          {{ t('button.sorting_mode') }}
        </NButton>
      </NDropdown>
      <NButton @click="toggleCreateNewRecipe()">
        {{ t('button.add_recipe') }}
      </NButton>
    </div>
  </div>
  <NModal v-model:show="isCreateNewRecipe">
    <RecipeCreate v-model:show-create-ingredient="isCreateNewRecipe" />
  </NModal>
</template>

<style scoped>

</style>
