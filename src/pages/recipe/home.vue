<script setup lang="ts">
import RecipeHeader from '~/components/recipe/recipeHeader.vue'

const recipeStore = useRecipeStore()
</script>

<template>
  <div>
    <div id="error-message">
      <p v-if="recipeStore.recipeQueryError">
        Une erreur est survenue {{ recipeStore.recipeQueryError }}
      </p>
    </div>
    <RecipeHeader />
    <div grid gap-2 md:grid-cols-2 xl:grid-cols-3>
      <RecipeBlock v-for="recipe in recipeStore.recipeList" :key="recipe.id" :recipe-data="recipe" />
    </div>
  </div>
</template>

<style scoped>

</style>
