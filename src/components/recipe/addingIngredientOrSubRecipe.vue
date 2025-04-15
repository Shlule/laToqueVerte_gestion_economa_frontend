<script setup lang="ts">
import { NTabPane, NTabs } from 'naive-ui'

const emits = defineEmits<{ (event: 'toggleAddingSomethingToRecipe'): void }>()

const { addRecipeIngredientBackend, recipeIngredientListToAdd } = useRecipeIngredientStore()
const { addSubRecipeBackend, subRecipeListToAdd } = useSubRecipeStore()
const { t } = useI18n()

const activeTab = ref<string>('recipeIngredient')

function confirm() {
  if (recipeIngredientListToAdd.length !== 0) {
    addRecipeIngredientBackend()
  }

  if (subRecipeListToAdd.length !== 0) {
    addSubRecipeBackend()
  }

  emits('toggleAddingSomethingToRecipe')
}

function cancel() {
  emits('toggleAddingSomethingToRecipe')
}
</script>

<template>
  <NCard role="form-dialog" title="Add ingredient to Recipe" w-75vw>
    <NTabs
      v-model:value="activeTab" justify-content="space-evenly" type="segment"
    >
      <NTabPane name="recipeIngredient">
        <RecipeIngredientCreate />
      </NTabPane>
      <NTabPane name="subRecipe">
        <SubRecipeCreate />
      </NTabPane>
    </NTabs>
    <div id="button-container" m-t-4 flex justify-end gap-2>
      <NButton type="success" flex text-green @click="confirm()">
        {{ t('button.confirm') }}
      </NButton>
      <NButton @click="cancel()">
        {{ t('button.cancel') }}
      </NButton>
    </div>
  </NCard>
</template>

<style scoped>

</style>
