<script setup lang="ts">
import { NCard } from 'naive-ui'
import { differenceInDays, format, startOfDay } from 'date-fns'
import type { Stock } from '~/types'

const stockData = defineModel<Stock>('stockData', { required: true })
const ingredientId = defineModel<string>('ingredientId', { required: true })

const { today, dayFormat } = useDateStore()
const { t } = useI18n()

// this is for the date Displayed
const convertedExpirationDate = computed(() => {
  const expirationDate = stockData.value.expirationDate
  return expirationDate ? format(expirationDate, dayFormat) : null
})

const showStockBlock = ref(true)
const showEditStockBlock = ref(false)
const daysRemaining = computed(() => {
  if (!stockData.value.expirationDate) {
    return
  }
  const expirationDate = startOfDay(stockData.value.expirationDate)
  return differenceInDays(expirationDate, today)
})

function deleteStock() {
  showStockBlock.value = false
  removeStock(stockData.value.id)
}
function toggleEditStock() {
  showStockBlock.value = !showStockBlock.value
  showEditStockBlock.value = !showEditStockBlock.value
}

// @TODO create function with kwargs can possibly get how many argument
// key value with seuil and value
const backgroundExpiration = computed(() => {
  let backgroundColor: string = ''

  if (!daysRemaining.value) {
    backgroundColor = 'bg-dark-1'
    return backgroundColor
  }

  switch (true) {
    case daysRemaining.value >= 10:
      backgroundColor = 'bg-green'
      break

    case daysRemaining.value < -1:
      backgroundColor = 'bg-dark-1'
      break

    case daysRemaining.value < 10 && daysRemaining.value >= 3 :
      backgroundColor = 'bg-amber'
      break

    case daysRemaining.value < 3 && daysRemaining.value >= 0:
      backgroundColor = 'bg-red-7'
      break

    default:
      backgroundColor = 'bg-dark-1'
      break
  }
  return backgroundColor
})
</script>

<template>
  <div v-if="showStockBlock" id="stock-container" m-y-3 w-full flex items-center gap-2>
    <div id="stock-card-container" w-full flex>
      <NCard :bordered="false" flex rounded-l-2xl p-0 shadow-xl>
        <div h-full flex justify-between>
          <div align-center text-6>
            {{ stockData.quantity }} {{ stockData.unit }}
          </div>
          <div id="expiration-date-block" flex self-center text-5>
            <div m-r-4 self-end text-4>
              {{ t('stock-block.expiration_date') }}:
            </div>
            {{ convertedExpirationDate }}
          </div>
          <div id="expiration-date-block" flex self-center text-5>
            <div m-r-4 self-end text-4>
              {{ t('stock-block.remaining_days') }}:
            </div>
            {{ daysRemaining }}
          </div>
        </div>
      </NCard>
      <div id="expiration-date-indicator" w-8 rounded-r-2xl :class="backgroundExpiration" />
    </div>
    <div id="button-menu" flex gap-3>
      <NButton type="success" circle text-green @click="toggleEditStock()">
        <div i-fluent:edit-20-regular />
      </NButton>
      <NButton circle type="error" text-red @click="deleteStock()">
        <div i-fluent:delete-24-regular />
      </NButton>
    </div>
  </div>
  <StockBlockEdit v-if="showEditStockBlock" :stock-data="stockData" :ingredient-id="ingredientId" @toggle-edit-stock-block="toggleEditStock" />
</template>

<style scoped>

</style>
