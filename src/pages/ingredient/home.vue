<script setup lang="ts">
const ingredientStore = useIngredientStore()
</script>

<template>
  <div>
    <div id="error-message">
      <p v-if="ingredientStore.ingredientQuerryError">
        Une erreur est survenue {{ ingredientStore.ingredientQuerryError }}
      </p>
    </div>
    <IngredientHeader />
    <div grid gap-2 md:grid-cols-2 xl:grid-cols-3>
      <IngredientBlock v-for="ingredient in ingredientStore.ingredientList" :key="ingredient.id" :ingredient-data="ingredient" />
    </div>
  </div>
</template>

<style scoped>

</style>
