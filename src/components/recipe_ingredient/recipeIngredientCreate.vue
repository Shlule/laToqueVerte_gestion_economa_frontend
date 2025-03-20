<script setup lang="ts">
import { NSpin, NSplit } from 'naive-ui'

const ingredientStore = useIngredientStore()
const { recipeIngredientListToAdd } = useRecipeIngredientStore()

const { t } = useI18n()
</script>

<template>
  <NCard role="form-dialog" title="Add ingredient to Recipe" w-75vw>
    <IngredientHeader />
    <NSplit id="recipeIngredient-create-container" direction="horizontal" :max="0.7" :min="0.6" :default-size="0.7">
      <template #1>
        <div id="ingredient-choice" p-2>
          <div v-if="ingredientStore.ingredientQueryError">
            {{ ingredientStore.ingredientQueryError }}
          </div>
          <div v-else-if="ingredientStore.ingredientQueryLoading" flex gap-2>
            <p>
              {{ t('loading.query') }}
            </p>
            <NSpin />
          </div>
          <div v-else grid gap-2 lg:grid-cols-2>
            <IngredientChoice v-for="ingredient in ingredientStore.ingredientList" :key="ingredient.id" :ingredient-data="ingredient" />
          </div>
        </div>
      </template>

      <template #2>
        <div id="ingredient-list" p-2>
          <div id="addRecipeIngredient-header">
            <h1 text-6>
              {{ t('addRecipeIngredient.title') }}
            </h1>
          </div>
          <RecipeIngredientToAdd v-for="(ingredientToAdd, index) in recipeIngredientListToAdd" :key="index" :ingredient-to-add-data="ingredientToAdd" :index="index" />
        </div>
      </template>
    </NSplit>

    <div id="button-container" m-t-4 flex justify-end gap-2>
      <NButton type="success" flex text-green>
        {{ t('button.confirm') }}
      </NButton>
      <NButton>
        {{ t('button.cancel') }}
      </NButton>
    </div>
  </NCard>
</template>

<style scoped>

</style>
