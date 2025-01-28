<script setup lang="ts">
import { format, parse } from 'date-fns'
import type { Stock, Unit } from '~/types'

// MYANCHOR[epic=edit_stock] all this file is important for editing stock

const emit = defineEmits<{
  (event: 'toggleEditStockBlock'): void
}>()

const stockData = defineModel<Stock>('stockData', { required: true })
const ingredientId = defineModel<string>('ingredientId', { required: true })

const { dayFormat } = useDateStore()
const { t } = useI18n()
const { editStockLocal } = useStockStore()

// work with localStockDate because modifying stock impact real data
const localStockData = stockData.value
const editExpirationDateDisplayed = ref<string>(format(localStockData.expirationDate, dayFormat))
const editQuantity = ref<number>(Number(localStockData.quantity))
const editUnit = ref<Unit>(localStockData.unit)

const editStockData = computed<Stock>(() => ({
  quantity: editQuantity.value,
  unit: editUnit.value,
  expirationDate: parse(editExpirationDateDisplayed.value, dayFormat, new Date()),
  id: stockData.value.id,
  ingredient: stockData.value.ingredient,
}))

function cancel() {
  emit('toggleEditStockBlock')
}

function confirm() {
  // modify on backend
  const { error } = editStock(editStockData.value)
  if (error.value) {
    console.error(error.value)
  }
  // update stocks list
  editStockLocal(ingredientId.value, stockData.value.id, editStockData.value)
  // close edit mode
  emit('toggleEditStockBlock')
}
</script>

<template>
  <div id="stockEdit-container" m-y-3 w-full flex items-center gap-2>
    <div w-full flex>
      <NCard :bordered="false" flex rounded-2xl p-0 shadow-xl>
        <div id="form-input-container" h-full flex justify-between gap-2>
          <div flex items-center gap-2 class="flex-basis-1/3">
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
          <div flex class="flex-basis-1/3">
            <NDatePicker v-model:formatted-value="editExpirationDateDisplayed" :format="dayFormat" type="date" />
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
