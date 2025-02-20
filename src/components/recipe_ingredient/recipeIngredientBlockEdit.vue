<script setup lang="ts">
import type { RecipeIngredient, Unit } from '~/types'

const emit = defineEmits<{ (event: 'toggleRecipeIngredientEdit'): void }> ()

const recipeIngredientData = defineModel<RecipeIngredient>('recipeIngredientData', { required: true })
const recipeId = defineModel<string>('recipeId', { required: true })

const { t } = useI18n()
const { updateRecipeIngredient } = useRecipeIngredientStore()

const localRecipeIngredientData = recipeIngredientData.value

const editUnit = ref<Unit>(localRecipeIngredientData.unit)
const editQuantity = ref<number>(Number(localRecipeIngredientData.quantityNeeded))
// ANCHOR - cost is calculate in front-end and and upload with edit request
// but when create a new recipe it is automaticly calculated

const editCost = computed(() => {
  const ingredientUnit = recipeIngredientData.value.ingredient.unitType
  const convertedQuantity = convertUnit(editQuantity.value, editUnit.value, ingredientUnit)
  return Number((recipeIngredientData.value.ingredient.pricePerUnit * convertedQuantity).toFixed(2))
})

const newRecipeIngredient = computed<RecipeIngredient>(() => ({
  ...recipeIngredientData.value,
  cost: editCost.value,
  quantityNeeded: editQuantity.value,
  unit: editUnit.value,
}),
)

function cancel() {
  emit('toggleRecipeIngredientEdit')
}

function confirm() {
  updateRecipeIngredient.mutate({ recipeIngredient: newRecipeIngredient.value, recipeId: recipeId.value })
  emit('toggleRecipeIngredientEdit')
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
            </p>
            <NSelect v-model:value="editUnit" :options="unitOptions" />
          </div>
        </div>
      </NCard>
    </div>
    {{ newRecipeIngredient }}
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
