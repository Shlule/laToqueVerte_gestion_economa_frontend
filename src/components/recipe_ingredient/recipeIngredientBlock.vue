<script setup lang="ts">
import RecipeIngredientBlockEdit from './recipeIngredientBlockEdit.vue'
import type { RecipeIngredient } from '~/types'

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
function toggleEditStock() {
  showRecipeIngredientBlock.value = !showRecipeIngredientBlock.value
  showEditRecipeIngredientBlock.value = !showEditRecipeIngredientBlock.value
}
</script>

<template>
  <div v-if="showRecipeIngredientBlock" id="stock-container" m-y-3 w-full flex items-center gap-2>
    <div id="stock-card-container" w-full flex>
      <NCard :bordered="false" flex rounded-2xl shadow-xl size="small">
        <div h-full flex justify-between>
          <div align-center text-6>
            {{ recipeIngredientData.ingredient.name }}
          </div>
          <div id="expiration-date-block" flex self-center text-5>
            <div m-r-4 self-end text-4>
              {{ t('recipeIngredient-block.quantity_needed') }}:
            </div>
            {{ recipeIngredientData.quantityNeeded }} {{ recipeIngredientData.unit }}
          </div>
          <div id="expiration-date-block" flex self-center text-5>
            <div m-r-4 self-end text-4>
              {{ t('recipeIngredient-block.cost') }}:
            </div>
            {{ recipeIngredientData.cost }}{{ t('money-symbol') }}
          </div>
        </div>
      </NCard>
    </div>
    <div id="button-menu" flex gap-3>
      <NButton type="success" circle text-green @click="toggleEditStock()">
        <div i-fluent:edit-20-regular />
      </NButton>
      <NButton circle type="error" text-red @click="deleteRecipeIngredient()">
        <div i-fluent:delete-24-regular />
      </NButton>
    </div>
  </div>
  <RecipeIngredientBlockEdit v-if="showEditRecipeIngredientBlock" :recipe-ingredient-data="recipeIngredientData" :recipe-id="recipeId" @toggle-recipe-ingredient-edit="toggleEditStock" />
</template>

<style scoped>

</style>
