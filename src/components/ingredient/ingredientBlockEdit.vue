<script setup lang="ts">
import type { Ingredient, Unit } from '~/types'

const emit = defineEmits<{
  (event: 'toggleEditIngredientBlock'): void
}>()
const { ingredientData } = defineModels<{ ingredientData: Ingredient }>()

const { unitOptions } = useStockStore()
const { t } = useI18n()

// work with localStockDate because modifying stock impact real data
const localIngredientData = ingredientData.value
const editUnitType = ref<Unit>(localIngredientData.unitType)
const editPricePerUnit = ref<number>(Number(localIngredientData.pricePerUnit))
const editFournisseur = ref<string>(localIngredientData.fournisseur)
const editName = ref<string>(localIngredientData.name)

const editIngredientData = computed<Ingredient>(() => ({

  id: ingredientData.value.id,
  name: editName.value,
  pricePerUnit: editPricePerUnit.value,
  fournisseur: editFournisseur.value,
  unitType: editUnitType.value,
  RecipeIngredients: ingredientData.value.RecipeIngredients,
  stock: ingredientData.value.stock,
}))
function cancel() {
  emit('toggleEditIngredientBlock')
}

function confirm() {
  // modify on backend
  editIngredient(editIngredientData.value)
  // update ingredient localy
  ingredientData.value.name = editName.value
  ingredientData.value.fournisseur = editFournisseur.value
  ingredientData.value.unitType = editUnitType.value
  ingredientData.value.pricePerUnit = editPricePerUnit.value
  // close edit mode
  emit('toggleEditIngredientBlock')
}
</script>

<template>
  <div id="stockEdit-container" m-y-3 w-full flex items-center gap-2>
    <div w-full flex>
      <NCard :bordered="false" flex rounded-2xl p-0 shadow-xl>
        <div id="form-input-container" h-full flex justify-between gap-2>
          <div flex class="flex-basis-1/4">
            <NInput v-model:formatted-value="editName" :placeholder="t('ingredient-block.input.name')" type="text" />
          </div>
          <div flex items-center gap-2 class="flex-basis-1/4">
            <NInputNumber v-model:value="editPricePerUnit" />
          </div>
          <div flex items-center gap-2 class="flex-basis-1/4">
            <NSelect v-model:value="editUnitType" :options="unitOptions" />
          </div>
          <div flex class="flex-basis-1/4">
            <NInput v-model:formatted-value="editFournisseur" :placeholder="t('ingredient-block.input.supplier')" type="text" />
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
