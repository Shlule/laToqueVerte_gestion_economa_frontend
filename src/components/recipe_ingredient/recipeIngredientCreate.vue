<script setup lang="ts">
import { NSpin } from 'naive-ui'

const ingredientStore = useIngredientStore()

const { t } = useI18n()
</script>

<template>
  <div>
    <NCard role="form-dialog" title="Add ingredient to Recipe">
      <IngredientHeader />
      <div v-if="ingredientStore.ingredientQueryError">
        {{ ingredientStore.ingredientQueryError }}
      </div>
      <div v-else-if="ingredientStore.ingredientQueryLoading" flex gap-2>
        <p>
          {{ t('loading.query') }}
        </p>
        <NSpin />
      </div>
      <div v-else grid gap-2 md:grid-cols-1 xl:grid-cols-2>
        <AddIngredientBlock v-for="ingredient in ingredientStore.ingredientList" :key="ingredient.id" :ingredient-data="ingredient" />
      </div>
    </NCard>
  </div>
</template>

<style scoped>

</style>
