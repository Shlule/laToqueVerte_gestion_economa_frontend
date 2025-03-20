<script setup lang="ts">
import type { AddToRecipe } from '~/types'

const props = defineProps<{ index: number }>()
const ingredientToAddData = defineModel<AddToRecipe>('ingredientToAddData', { required: true })
const { t } = useI18n()

const { deleteRecipeIngredientToList } = useRecipeIngredientStore()

const showRecipeIngredientToAddEdit = ref(false)
const showRecipeIngredientToAdd = ref(true)

function toggleEdit() {
  showRecipeIngredientToAdd.value = !showRecipeIngredientToAdd.value
  showRecipeIngredientToAddEdit.value = !showRecipeIngredientToAddEdit.value
}

function deleteRecipeIngredientToAdd() {
  deleteRecipeIngredientToList(props.index)
}
</script>

<template>
  <div>
    <div v-if="showRecipeIngredientToAdd" flex flex-col>
      <NCard flex rounded-2xl shadow-xl size="small">
        <div h-full flex justify-between>
          <div flex gap-2>
            <div align-center text-6>
              {{ ingredientToAddData.ingredient.name }}
            </div>
            <div self-end>
              de "{{ ingredientToAddData.ingredient.fournisseur }}"
            </div>
          </div>
          <div flex self-center text-5>
            <div m-r-4 self-end text-4>
              {{ t('recipeIngredient-block.quantity_needed') }}:
            </div>
            {{ ingredientToAddData.quantityNeeded }} {{ ingredientToAddData.unit }}
          </div>
          <div id="button-menu" flex gap-3>
            <NButton type="success" circle text-green @click="toggleEdit()">
              <div i-fluent:edit-20-regular />
            </NButton>
            <NButton circle type="error" text-red @click="deleteRecipeIngredientToAdd()">
              <div i-fluent:delete-24-regular />
            </NButton>
          </div>
        </div>
      </NCard>
    </div>
    <RecipeIngredientToAddEdit v-if="showRecipeIngredientToAddEdit" :recipe-ingredient-to-add-data="ingredientToAddData" @toggle-edit-mode="toggleEdit()" />
  </div>
</template>

<style scoped>

</style>
