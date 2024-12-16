<script setup lang="ts">
import { useIngredientStore } from '~/stores/ingredients'

const ingredientStore = useIngredientStore()
function handleSelect(key: string) {
  ingredientStore.sortSelected = key
}

const [isCreateNewIngredient, toggleCreateNewIngredient] = useToggle()

function test() {
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
  <div id="ingredient-header-container" flex items-center justify-between>
    <div m-l-10 flex text-16>
      title
    </div>
    <div id="button-menu" m-r-12 flex gap-6>
      <div>
        {{ sortOrder }}
      </div>
      <NButton circle @click="test()">
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
  <NModal v-model:show="isCreateNewIngredient">
    <IngredientCreate v-model:show-create-ingredient="isCreateNewIngredient" />
  </NModal>
</template>

<style scoped>

</style>
