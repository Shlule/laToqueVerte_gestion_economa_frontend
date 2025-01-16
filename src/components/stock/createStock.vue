<script setup lang="ts">
import { NDatePicker, NInputNumber, NSelect, useNotification } from 'naive-ui'

const { showCreateStock, ingredientId } = defineModels<{ showCreateStock: boolean, ingredientId: string }>()

const stockStore = useStockStore()
const { dayFormat } = useDateStore()
const notification = useNotification()
const { t } = useI18n()

function toggleShowCreateStock() {
  showCreateStock.value = !showCreateStock.value
}

stockStore.ingredientId = ingredientId.value

async function createStock() {
  const { error } = await stockStore.addNewStock(ingredientId.value)
  toggleShowCreateStock()

  if (error.value) {
    notification.create({
      title: 'Erreur',
      content: `Échec de la création du stock : ${error.value || 'Une erreur inconnue est survenue.'}`,
      type: 'error',
      duration: 2500,
    })
  }
  else {
    notification.create({
      title: 'Reussite',
      content: ' la creation du Stock est un succes',
      type: 'success',
      duration: 2500,
    })
  }
}
</script>

<template>
  <NCard role="form-dialog" title="Create New Stock" w-36rem flex>
    <div id="forms-input" flex gap-2>
      <div flex gap-2>
        <div flex items-center gap-2 class="flex-basis-1/3">
          <p flex-shrink-0>
            {{ t('stock-create.form_input.quantity') }}
          </p>
          <NInputNumber v-model:value="stockStore.newStockQuantity" />
        </div>
        <div flex items-center gap-2 class="flex-basis-1/3">
          <p flex shrink-0>
            {{ t('stock-create.form_input.unit') }}
          </p>
          <NSelect v-model:value="stockStore.newStockUnit" :options="stockStore.unitOptions" />
        </div>
        <div flex class="flex-basis-1/3">
          <NDatePicker v-model:formatted-value="stockStore.expirationDateDisplayed" :format="dayFormat" type="date" />
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
