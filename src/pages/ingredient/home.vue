<script setup lang="ts">
// import api from '~/composables/apiService'
import { getAllIngredient } from '~/composables/apiService'

// const { data } = useAxios('/ingredients', { method: 'GET' }, api)
const { data: ingredients, error } = getAllIngredient()
</script>

<template>
  <div>
    <div id="error-message">
      <p v-if="error">
        Une erreur est survenue {{ error }}
      </p>
    </div>
    <IngredientBlock v-for="ingredient in ingredients" :key="ingredient.id" :ingredient-data="ingredient" />
    <!-- {{ ingredients }} -->
  </div>
</template>

<style scoped>

</style>
