<script setup lang="ts">
import { NInput } from 'naive-ui'
import { useIngredientStore } from '~/stores/ingredients'

const ingredientStore = useIngredientStore()
const createIngredientStore = useCreateIngredientStore()
function handleSelect(key: string) {
  ingredientStore.sortSelected = key
}

const [isCreateNewIngredient, toggleCreateNewIngredient] = useToggle()

watch(isCreateNewIngredient, (newX) => {
  if (newX === false) {
    createIngredientStore.resetForm()
  }
})

function swapOrder() {
  ingredientStore.isAscendantOrder = !ingredientStore.isAscendantOrder
}

const sortOrder = computed(() => {
  if (ingredientStore.isAscendantOrder) {
    return 'croissant'
  }
  else {
    return 'decroissant'
  }
})
</script>

<template>
  <div id="ingredient-header-container" flex items-center justify-between gap-4>
    <div m-l-10 flex shrink-0 text-16>
      Ingredient
    </div>
    <NInput v-model:value="ingredientStore.searchBarInput" placeholder="search Ingredient" type="text" round flex>
      <template #prefix>
        <div i-fluent:search-20-filled text-4 />
      </template>
    </NInput>
    <div id="button-menu" m-r-12 flex gap-4>
      <div>
        {{ sortOrder }}
      </div>
      <NButton circle @click="swapOrder()">
        <div i-fluent:arrow-sort-20-regular />
      </NButton>
      <div />
      <div>
        {{ ingredientStore.sortSelected }}
      </div>
      <NDropdown trigger="hover" :options="ingredientStore.sortOptions" @select="handleSelect">
        <NButton>
          Trier par
        </NButton>
      </NDropdown>
      <NButton @click="toggleCreateNewIngredient()">
        New Ingredient
      </NButton>
    </div>
  </div>
  <NModal v-model:show="isCreateNewIngredient" @close="createIngredientStore.resetForm()">
    <IngredientCreate v-model:show-create-ingredient="isCreateNewIngredient" />
  </NModal>
</template>

<style scoped>

</style>
