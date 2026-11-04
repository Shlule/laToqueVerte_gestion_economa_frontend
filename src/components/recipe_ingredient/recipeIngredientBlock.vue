<script setup lang="ts">
import type { InsufficientIngredient, RecipeIngredient } from '~/types'
import { formatPrice } from '~/composables/money'
import RecipeIngredientBlockEdit from './recipeIngredientBlockEdit.vue'

defineProps<{ missing?: InsufficientIngredient }>()
const recipeIngredientData = defineModel<RecipeIngredient>('recipeIngredientData', { required: true })
const recipeId = defineModel<string>('recipeId', { required: true })

const { t } = useI18n()
const { removeRecipeIngredient } = useRecipeIngredientStore()

const showRecipeIngredientBlock = ref(true)
const showEditRecipeIngredientBlock = ref(false)

function deleteRecipeIngredient() {
  showRecipeIngredientBlock.value = false
  removeRecipeIngredient.mutate({ recipeIngredientId: recipeIngredientData.value.id, recipeId: recipeId.value })
}
function toggleEdit() {
  showRecipeIngredientBlock.value = !showRecipeIngredientBlock.value
  showEditRecipeIngredientBlock.value = !showEditRecipeIngredientBlock.value
}
</script>

<template>
  <div v-if="showRecipeIngredientBlock" w-full flex items-center gap-2 py-1>
    <div min-w-0 flex flex-1 flex-col gap-1 rounded-xl px-3 py-2 text-left shadow-sm bg="gray-500/6">
      <span truncate text-lg :title="recipeIngredientData.ingredient.name">{{ recipeIngredientData.ingredient.name }}</span>
      <div flex flex-wrap items-center gap-x-3 gap-y-1 text-sm>
        <span opacity-80>{{ Number(recipeIngredientData.quantityNeeded) }} {{ recipeIngredientData.unit }}</span>
        <span v-if="missing" rounded-full px-2 py-0.5 text-xs text-red-600 bg="red-500/12" dark:text-red-300 :title="t('recipeIngredient-block.missing_title')">
          {{ t('recipeIngredient-block.missing', { quantity: Number(missing.missingQuantity), unit: missing.unit }) }}
        </span>
        <span ml-auto font-mono>{{ formatPrice(recipeIngredientData.cost) }}</span>
      </div>
    </div>
    <div flex shrink-0 gap-2>
      <NButton type="success" circle text-green :title="t('recipeIngredient-block.edit')" @click="toggleEdit()">
        <div i-fluent:edit-20-regular />
      </NButton>
      <NButton circle type="error" text-red :title="t('recipeIngredient-block.delete')" @click="deleteRecipeIngredient()">
        <div i-fluent:delete-24-regular />
      </NButton>
    </div>
  </div>
  <RecipeIngredientBlockEdit v-if="showEditRecipeIngredientBlock" :recipe-ingredient-data="recipeIngredientData" :recipe-id="recipeId" @toggle-recipe-ingredient-edit="toggleEdit" />
</template>

<style scoped>

</style>
