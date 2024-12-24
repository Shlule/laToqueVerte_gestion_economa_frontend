<script setup lang="ts">
import { NDatePicker, NInputNumber, NSelect, useNotification } from 'naive-ui'

const props = defineProps<{ showCreateStock: boolean, ingredientId: string }>()
const showCreateIngredient = useVModel(props, 'showCreateStock')
const ingredientId = useVModel(props, 'ingredientId')

const createStockStore = useCreateStockStore()
const { dayFormat } = useDateStore()
const notification = useNotification()
const { t } = useI18n()

function toggleShowCreateStock() {
  showCreateIngredient.value = !showCreateIngredient.value
}

createStockStore.ingredientId = ingredientId.value

function createStock() {
  toggleShowCreateStock()
  notification.create({
    title: 'Reussite',
    content: ' la creation du Stock est un succes',
    type: 'success',
    duration: 2500,
  })
}

const unitOptions = [{
  label: 'kg',
  value: 'kg',
}, {
  label: 'g',
  value: 'g',
}, {
  label: 'unit',
  value: 'unit',
}]
</script>

<template>
  <NCard role="form-dialog" title="Create New Stock" w-36rem flex>
    <div id="forms-input" flex gap-2>
      <div flex gap-2>
        <div flex items-center gap-2 class="flex-basis-1/3">
          <p flex-shrink-0>
            {{ t('stock-create.form_input.quantity') }}
          </p>
          <NInputNumber v-model:value="createStockStore.newStockQuantity" />
        </div>
        <div flex items-center gap-2 class="flex-basis-1/3">
          <p flex shrink-0>
            {{ t('stock-create.form_input.unit') }}
          </p>
          <NSelect v-model:value="createStockStore.newStockUnit" :options="unitOptions" />
        </div>
        <div flex class="flex-basis-1/3">
          <NDatePicker v-model:formatted-value="createStockStore.expirationDateDisplayed" :format="dayFormat" type="date" />
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
