<script setup lang="ts">
import type { AddSubRecipe, AddToRecipe, Unit } from '~/types'

const emit = defineEmits<{ (event: 'toggleEditMode'): void }>()
const recipeIngredientToAddData = defineModel<AddToRecipe | AddSubRecipe>('recipeIngredientToAddData', { required: true })
const { t } = useI18n()

const editUnit = ref<Unit>('kg')
const editQuantity = ref<number>(0)

function cancel() {
  emit('toggleEditMode')
}

function confirm() {
  recipeIngredientToAddData.value.quantityNeeded = editQuantity.value
  recipeIngredientToAddData.value.unit = editUnit.value
  emit('toggleEditMode')
}
</script>

<template>
  <div id="recipeIngredientToAddEdit-container" m-y-3 w-full flex items-center gap-2>
    <div w-full flex>
      <NCard :bordered="false" flex rounded-2xl p-0 shadow-xl>
        <div id="form-input-container" h-full flex justify-between gap-2>
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
