<script setup lang="ts">
import { NButton } from 'naive-ui'

const { t } = useI18n()
const recipeStore = useRecipeStore()
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
        <div flex>
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
