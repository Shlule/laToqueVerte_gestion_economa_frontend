<script setup lang="ts">
import type { AddSubRecipe } from '~/types'

const props = defineProps<{ index: number }>()
const subRecipeToAddData = defineModel<AddSubRecipe>('subRecipeToAddData', { required: true })
const { t } = useI18n()

const { deleteSubRecipeToList } = useSubRecipeStore()

const showSubRecipeToAddEdit = ref(false)
const showSubRecipeToAdd = ref(true)

function toggleEdit() {
  showSubRecipeToAdd.value = !showSubRecipeToAdd.value
  showSubRecipeToAddEdit.value = !showSubRecipeToAddEdit.value
}

function deleteSubRecipeToAdd() {
  deleteSubRecipeToList(props.index)
}
</script>

<template>
  <div>
    <div v-if="showSubRecipeToAdd" flex flex-col>
      <NCard flex rounded-2xl shadow-xl size="small">
        <div h-full flex justify-between>
          <div align-center text-6>
            {{ subRecipeToAddData.childRecipe.name }}
          </div>

          <div flex self-center text-5>
            <div m-r-4 self-end text-4>
              {{ t('recipeIngredient-block.quantity_needed') }}:
            </div>
            {{ subRecipeToAddData.quantityNeeded }} {{ subRecipeToAddData.unit }}
          </div>
          <div id="button-menu" flex gap-3>
            <NButton type="success" circle text-green @click="toggleEdit()">
              <div i-fluent:edit-20-regular />
            </NButton>
            <NButton circle type="error" text-red @click="deleteSubRecipeToAdd()">
              <div i-fluent:delete-24-regular />
            </NButton>
          </div>
        </div>
      </NCard>
    </div>
    <RecipeIngredientToAddEdit v-if="showSubRecipeToAddEdit" :recipe-ingredient-to-add-data="subRecipeToAddData" @toggle-edit-mode="toggleEdit()" />
  </div>
</template>

<style scoped>

</style>
