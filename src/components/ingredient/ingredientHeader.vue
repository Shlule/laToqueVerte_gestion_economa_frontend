<script setup lang="ts">
import { NInput } from 'naive-ui'
import { useIngredientStore } from '~/stores/ingredients'

const { t } = useI18n()
const ingredientStore = useIngredientStore()
const { resetIngredientForm } = useCreateIngredientStore()
const [isCreateNewIngredient, toggleCreateNewIngredient] = useToggle()

function handleSelect(key: string) {
  ingredientStore.sortSelected = key
}

watch(isCreateNewIngredient, (newX) => {
  if (newX === false) {
    resetIngredientForm()
  }
})

function swapOrder() {
  ingredientStore.isAscendantOrder = !ingredientStore.isAscendantOrder
}
</script>

<template>
  <div id="ingredient-header-container" flex items-center justify-between gap-4>
    <div m-l-10 flex shrink-0 text-16>
      {{ t('ingredient-header.title') }}
    </div>
    <NInput v-model:value="ingredientStore.searchBarInput" :placeholder="t('ingredient-header.search_bar')" type="text" round flex>
      <template #prefix>
        <div i-fluent:search-20-filled text-4 />
      </template>
    </NInput>
    <div id="button-menu" m-r-12 flex gap-4>
      <NButton circle @click="swapOrder()">
        <div i-fluent:arrow-sort-20-regular />
      </NButton>
      <div />
      <NDropdown trigger="hover" :options="ingredientStore.sortOptions" @select="handleSelect">
        <NButton>
          {{ t('button.sorting_mode') }}
        </NButton>
      </NDropdown>
      <NButton @click="toggleCreateNewIngredient()">
        {{ t('button.add_ingredient') }}
      </NButton>
    </div>
  </div>
  <NModal v-model:show="isCreateNewIngredient" @close="resetIngredientForm()">
    <IngredientCreate v-model:show-create-ingredient="isCreateNewIngredient" />
  </NModal>
</template>

<style scoped>

</style>
