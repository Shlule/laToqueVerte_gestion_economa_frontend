<script setup lang="ts">
import RecipeHeader from '~/components/recipe/recipeHeader.vue'

const ingredientStore = useIngredientStore()
</script>

<template>
  <div>
    <div id="error-message">
      <p v-if="ingredientStore.ingredientError">
        Une erreur est survenue {{ ingredientStore.ingredientError }}
      </p>
    </div>
    <RecipeHeader />
  </div>
</template>

<style scoped>

</style>
