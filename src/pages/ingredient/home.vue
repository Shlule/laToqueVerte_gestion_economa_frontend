<script setup lang="ts">
import { getAllIngredient } from '~/composables/apiService'

// const { data } = useAxios('/api/ingredients', { method: 'GET' }, api)
const { data: ingredients, error } = getAllIngredient()
</script>

<template>
  <div>
    <div id="error-message">
      <p v-if="error">
        Une erreur est survenue {{ error }}
      </p>
    </div>
    <div flex gap-12>
      <IngredientBlock v-for="ingredient in ingredients" :key="ingredient.id" :ingredient-data="ingredient" />
    </div>
  </div>
</template>

<style scoped>

</style>
