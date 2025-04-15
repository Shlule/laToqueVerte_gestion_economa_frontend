<script setup lang="ts">
// TODO - 1 try to create generic component for this one and RecipeIngredientBlockEdit
// TODO - 2 try to create generic component for all editing

import type { SubRecipe, Unit } from '~/types'

const emit = defineEmits<{ (event: 'toggleSubRecipeEdit'): void }> ()

const subRecipeData = defineModel<SubRecipe>('SubRecipeData', { required: true })
const recipeId = defineModel<string>('recipeId', { required: true })

const { t } = useI18n()
const { updateSubRecipe } = useSubRecipeStore()

const localSubRecipeData = subRecipeData.value

const editUnit = ref<Unit>(localSubRecipeData.unit)
const editQuantity = ref<number>(Number(localSubRecipeData.quantityNeeded))
// ANCHOR - cost is calculate in front-end and and upload with edit request
// but when create a new recipe it is automaticly calculated

const editCost = computed(() => {
  const childRecipeCost = subRecipeData.value.childRecipe.cost
  const childRecipeQuantity = subRecipeData.value.childRecipe.quantity
  const childRecipeUnit = subRecipeData.value.childRecipe.unitType
  const pricePerUnit = childRecipeCost / childRecipeQuantity
  const convertedQuantity = convertUnit(editQuantity.value, editUnit.value, childRecipeUnit)
  return Number((pricePerUnit * convertedQuantity).toFixed(2))
})

// TODO - recalculate cost in backend and donc send cost in update request
// ANCHOR - use plain objet for keeping objet id for sure
const newSubRecipe = computed<SubRecipe>(() => ({
  ...subRecipeData.value,
  cost: editCost.value,
  quantityNeeded: editQuantity.value,
  unit: editUnit.value,
}),
)

function cancel() {
  emit('toggleSubRecipeEdit')
}

function confirm() {
  updateSubRecipe.mutate({ subRecipe: newSubRecipe.value, recipeId: recipeId.value })
  emit('toggleSubRecipeEdit')
}
</script>

<template>
  <div id="stockEdit-container" m-y-3 w-full flex items-center gap-2>
    <div w-full flex>
      <NCard :bordered="false" flex rounded-2xl p-0 shadow-xl>
        <div id="form-input-container" h-full flex justify-evenly gap-2>
          <div flex items-center gap-2 class="flex-basis-2/3">
            <p flex-shrink-0>
              {{ t('stock-create.form_input.quantity') }}:
            </p>
            <NInputNumber v-model:value="editQuantity" />
          </div>
          <div flex items-center gap-2 class="flex-basis-1/3">
            <p flex shrink-0>
              {{ t('stock-create.form_input.unit') }}:
              {{ editCost }}
            </p>
            <NSelect v-model:value="editUnit" :options="unitOptions" />
          </div>
        </div>
      </NCard>
    </div>
    <div id="button-menu" flex gap-3>
      <NButton circle type="error" text-red @click="cancel()">
        <div i-material-symbols:close-rounded />
      </NButton>
      <NButton circle type="success" text-green @click="confirm()">
        <div i-fluent:checkmark-20-regular />
      </NButton>
    </div>
  </div>
</template>

<style scoped>

</style>
