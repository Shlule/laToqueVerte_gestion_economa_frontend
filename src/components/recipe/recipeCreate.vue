<script setup lang="ts">
import { NButton } from 'naive-ui'

const { t } = useI18n()
const recipeStore = useRecipeStore()

const isWeightRecipeOption = computed (() => {
  return recipeStore.recipeOptionSelected === t('recipe-option.weight')
})
</script>

<template>
  <div>
    <div id="form-input-container" flex flex-col gap-4>
      <div flex items-center gap-4>
        <p>Name: </p>
        <NInput type="text" placeholder="Name" />
      </div>
      <div flex items-center gap-4>
        <NSelect v-model:value="recipeStore.recipeOptionSelected" :options="recipeStore.recipeOptions" />
        <div v-if="isWeightRecipeOption" flex gap-2>
          <NInputNumber v-model:value="recipeStore.weight" />
          <NSelect v-model:value="recipeStore.recipeUnit" :options="unitOptions" />
        </div>
        <div v-else flex>
          <NInputNumber v-model:value="recipeStore.nbOfPiece" />
        </div>
      </div>
    </div>
    <div id="button-container" m-t-4 flex justify-end gap-2>
      <NButton type="success" flex text-green>
        {{ t('button.confirm') }}
      </NButton>
      <NButton>
        {{ t('button.cancel') }}
      </NButton>
    </div>
  </div>
</template>

<style scoped>

</style>
