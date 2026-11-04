<script setup lang="ts">
// TODO - 1 try to create generic component with this one and RecipeIngredientBlock
// TODO - 2 try to create generic compoenent for all Block
import type { SubRecipe } from '~/types'
import { formatPrice } from '~/composables/money'
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
  <div v-if="showSubRecipeBlock" id="stock-container" m-y-3 w-full flex items-center gap-2>
    <div id="stock-card-container" w-full flex>
      <NCard :bordered="false" flex rounded-2xl shadow-xl size="small">
        <div h-full flex justify-between>
          <div align-center text-6>
            {{ subRecipeData.childRecipe.name }}
          </div>
          <div id="expiration-date-block" flex self-center text-5>
            <div m-r-4 self-end text-4>
              {{ t('recipeIngredient-block.quantity_needed') }}:
            </div>
            {{ subRecipeData.quantityNeeded }} {{ subRecipeData.unit }}
          </div>
          <div id="expiration-date-block" flex self-center text-5>
            <div m-r-4 self-end text-4>
              {{ t('recipeIngredient-block.cost') }}:
            </div>
            {{ formatPrice(subRecipeData.cost) }}
          </div>
        </div>
      </NCard>
    </div>
    <div id="button-menu" flex gap-3>
      <NButton type="success" circle text-green @click="toggleEdit()">
        <div i-fluent:edit-20-regular />
      </NButton>
      <NButton circle type="error" text-red @click="deleteSubRecipe()">
        <div i-fluent:delete-24-regular />
      </NButton>
    </div>
  </div>
  <SubRecipeBlockEdit v-if="showEditSubRecipeBlock" :-sub-recipe-data="subRecipeData" :recipe-id="recipeId" @toggle-sub-recipe-edit="toggleEdit" />
</template>

<style scoped>

</style>
