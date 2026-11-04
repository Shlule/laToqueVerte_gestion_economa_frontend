<script setup lang="ts">
import type { SupplierStockCreation, Unit } from '~/types'
import { formatISO, isValid, parse } from 'date-fns'
import { NDatePicker, NInput, NInputNumber, NSelect, useNotification } from 'naive-ui'

const showCreateStock = defineModel<boolean>('showCreateStock', { required: true })
const ingredientId = defineModel<string>('ingredientId', { required: true })

const { addStock } = useStockStore()
const { dayFormat } = useDateStore()
const notification = useNotification()
const { t } = useI18n()

const dateStore = useDateStore()
const newStockUnit = ref<Unit>('kg')
const newStockQuantity = ref<number>(0)
const newStockLotNumber = ref('')
const expirationDateDisplayed = ref<string>(dateStore.todayFormated)

const newStockExpirationDate = computed<string>(() => {
  const parsedDate = parse(expirationDateDisplayed.value, dateStore.dayFormat, new Date())
  if (isValid(parsedDate) === false) {
    throw new Error('Invalid date format. Expected format: dd/MM/yyyy')
  }
  return formatISO(parsedDate)
})

const newStock = computed<SupplierStockCreation>(() => ({
  ingredient: ingredientId.value,
  lotNumber: newStockLotNumber.value.trim(),
  unit: newStockUnit.value,
  quantity: newStockQuantity.value,
  // this value must be in ISO format
  expirationDate: newStockExpirationDate.value,
}))

function toggleShowCreateStock() {
  showCreateStock.value = !showCreateStock.value
}

// stockStore.ingredientId = ingredientId.value

async function createStock() {
  toggleShowCreateStock()
  addStock.mutate({ newStock: newStock.value, ingredientId: ingredientId.value }, {
    onSuccess: () => notification.create({
      title: 'Réussite',
      content: 'La création du stock est un succès',
      type: 'success',
      duration: 2500,
    }),
    onError: error => notification.create({
      title: 'Erreur',
      content: `Échec de la création du stock : ${error.message || 'Une erreur inconnue est survenue.'}`,
      type: 'error',
      duration: 2500,
    }),
  })
}
</script>

<template>
  <NCard role="form-dialog" title="Create New Stock" w-36rem flex>
    <div id="forms-input" flex flex-col gap-3>
      <div flex items-center gap-2>
        <p flex-shrink-0>
          {{ t('stock-create.form_input.lot_number') }}
        </p>
        <NInput v-model:value="newStockLotNumber" :placeholder="t('stock-create.form_input.lot_placeholder')" />
      </div>
      <div flex gap-2>
        <div flex items-center gap-2 class="flex-basis-1/3">
          <p flex-shrink-0>
            {{ t('stock-create.form_input.quantity') }}
          </p>
          <NInputNumber v-model:value="newStockQuantity" />
        </div>
        <div flex items-center gap-2 class="flex-basis-1/3">
          <p flex shrink-0>
            {{ t('stock-create.form_input.unit') }}
          </p>
          <NSelect v-model:value="newStockUnit" :options="unitOptions" />
        </div>
        <div flex class="flex-basis-1/3">
          <NDatePicker v-model:formatted-value="expirationDateDisplayed" :format="dayFormat" type="date" />
        </div>
      </div>
    </div>
    <div id="buttons" m-t-4 flex justify-end gap-2>
      <NButton type="success" text-green @click="createStock">
        {{ t('button.confirm') }}
      </NButton>
      <NButton @click="toggleShowCreateStock()">
        {{ t('button.cancel') }}
      </NButton>
    </div>
  </NCard>
</template>

<style scoped>

</style>
