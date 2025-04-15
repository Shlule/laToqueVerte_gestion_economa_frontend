<script setup lang="ts">
// TODO - try to create generic component for this one and RecipeIngredientCreate

// ANCHOR -  this is the same schema as recipeIngredientCreate
const recipeStore = useRecipeStore()
const { subRecipeListToAdd } = useSubRecipeStore()

const { t } = useI18n()
</script>

<template>
  <div>
    <RecipeHeader />
    <NSplit id="subRecipe-create-container" direction="horizontal" :max="0.7" :min="0.6" :default-size="0.7">
      <template #1>
        <div id="ingredient-choice" p-2>
          <div v-if="recipeStore.recipeQueryError">
            {{ recipeStore.recipeQueryError }}
          </div>
          <div v-else-if="recipeStore.recipeQueryLoading" flex gap-2>
            <p>
              {{ t('loading.query') }}
            </p>
            <NSpin />
          </div>
          <div v-else grid gap-2 lg:grid-cols-2>
            <SubRecipeChoice v-for="Recipe in recipeStore.recipeList" :key="Recipe.id" :-recipe-data="Recipe" />
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
          <SubRecipeToAdd v-for="(subRecipeToAdd, index) in subRecipeListToAdd" :key="index" :sub-recipe-to-add-data="subRecipeToAdd" :index="index" />
        </div>
      </template>
    </NSplit>
  </div>
</template>

<style scoped>

</style>
