<script setup lang="ts">
// TODO - 1 try to create generic component with this one and RecipeIngredientBlock
// TODO - 2 try to create generic compoenent for all Block
import type { InsufficientSubRecipe, SubRecipe } from '~/types'
import { formatPrice } from '~/composables/money'

defineProps<{ missing?: InsufficientSubRecipe }>()
// import RecipeIngredientBlockEdit from './recipeIngredientBlockEdit.vue'

const subRecipeData = defineModel<SubRecipe>('recipeIngredientData', { required: true })
const recipeId = defineModel<string>('recipeId', { required: true })

const { t } = useI18n()
const { removeSubRecipe } = useSubRecipeStore()

const showSubRecipeBlock = ref(true)
const showEditSubRecipeBlock = ref(false)

function deleteSubRecipe() {
  showSubRecipeBlock.value = false
  removeSubRecipe.mutate({ subRecipeId: subRecipeData.value.id, recipeId: recipeId.value })
}
function toggleEdit() {
  showSubRecipeBlock.value = !showSubRecipeBlock.value
  showEditSubRecipeBlock.value = !showEditSubRecipeBlock.value
}
</script>

<template>
  <div v-if="showSubRecipeBlock" w-full flex items-center gap-2 py-1>
    <div min-w-0 flex flex-1 flex-col gap-1 rounded-xl px-3 py-2 text-left shadow-sm bg="gray-500/6">
      <span truncate text-lg :title="subRecipeData.childRecipe.name">{{ subRecipeData.childRecipe.name }}</span>
      <div flex flex-wrap items-center gap-x-3 gap-y-1 text-sm>
        <span opacity-80>{{ Number(subRecipeData.quantityNeeded) }} {{ subRecipeData.unit }}</span>
        <span v-if="missing" rounded-full px-2 py-0.5 text-xs text-red-600 bg="red-500/12" dark:text-red-300 :title="t('recipeIngredient-block.missing_title')">
          {{ t('recipeIngredient-block.missing', { quantity: Number(missing.missingQuantity), unit: missing.unit }) }}
        </span>
        <span ml-auto font-mono>{{ formatPrice(subRecipeData.cost) }}</span>
      </div>
    </div>
    <div flex shrink-0 gap-2>
      <NButton type="success" circle text-green :title="t('recipeIngredient-block.edit')" @click="toggleEdit()">
        <div i-fluent:edit-20-regular />
      </NButton>
      <NButton circle type="error" text-red :title="t('recipeIngredient-block.delete')" @click="deleteSubRecipe()">
        <div i-fluent:delete-24-regular />
      </NButton>
    </div>
  </div>
  <SubRecipeBlockEdit v-if="showEditSubRecipeBlock" :-sub-recipe-data="subRecipeData" :recipe-id="recipeId" @toggle-sub-recipe-edit="toggleEdit" />
</template>

<style scoped>

</style>
