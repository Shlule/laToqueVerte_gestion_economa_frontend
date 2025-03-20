<script setup lang="ts">
import { NButton } from 'naive-ui'

const { t } = useI18n()
const { recipeOptions } = useRecipeStore()

const recipeUnit = ref<Unit>('kg')
const nbOfPiece = ref<number>()
const weight = ref<number>()

const recipeOptionSelected = ref<string>(t('recipe-option.number_of_piece'))
</script>

<template>
  <div p-4>
    <div id="form-input-container" flex flex-col gap-4>
      <div flex items-center gap-4>
        <p>Name: </p>
        <NInput type="text" placeholder="Name" aria-required="true" />
      </div>
      <div flex items-center gap-4>
        <NSelect v-model:value="recipeOptionSelected" :options="recipeOptions" />
        <div v-if="recipeOptionSelected === t('recipe-option.number_of_piece')" flex>
          <NInputNumber v-model:value="nbOfPiece" />
        </div>
        <div v-if="recipeOptionSelected === t('recipe-option.weight')" flex gap-2>
          <NInputNumber v-model:value="weight" />
          <NSelect v-model:value="recipeUnit" :options="unitOptions" w-10rem />
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
