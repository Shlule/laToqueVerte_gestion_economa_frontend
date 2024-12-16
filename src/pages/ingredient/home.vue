<script setup lang="ts">
const ingredientStore = useIngredientStore()
</script>

<template>
  <div>
    <div id="error-message">
      <p v-if="ingredientStore.ingredientError">
        Une erreur est survenue {{ ingredientStore.ingredientError }}
      </p>
    </div>
    <IngredientHeader />
    <div grid gap-2 md:grid-cols-2 xl:grid-cols-3>
      <IngredientBlock v-for="ingredient in ingredientStore.sortedIngredientList" :key="ingredient.id" :ingredient-data="ingredient" />
    </div>
  </div>
</template>

<style scoped>

</style>
