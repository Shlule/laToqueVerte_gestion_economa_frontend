<script setup lang="ts">
import { NCard } from 'naive-ui'
import { format } from 'date-fns'
import type { Stock } from '~/types'
import { useExpirationIndicator } from '~/composables/expirationIndicator'
import economa_backend_api from '~/composables/apiService'

const props = defineProps<{ stockData: Stock }>()
const stockData = useVModel(props, 'stockData')
const convertedDate = computed(() => {
  const expirationDate = stockData.value?.expirationDate
  return expirationDate ? format(expirationDate, 'P') : null
})

const localStockData = ref(stockData.value)
const showStockBlock = ref(true)
const showEditStockBlock = ref(false)
const { calculateExpirationInterval } = useExpirationIndicator()
const expirationInterval = computed(() => {
  const expirationDate = stockData.value?.expirationDate
  return expirationDate ? calculateExpirationInterval(expirationDate).days : null
})

function deleteStock() {
  showStockBlock.value = false
  economa_backend_api.delete(`/stocks/${stockData.value.id}`)
}
function editStock() {
  showStockBlock.value = false
  showEditStockBlock.value = true
}

// @TODO create function with kwargs can possibly get how many argument
// key value with seuil and value
const backgroundExpiration = computed(() => {
  const expirationDate = stockData.value.expirationDate
  if (!expirationDate) {
    return
  }
  if (!expirationInterval.value) {
    return
  }
  let backgroundColor: string = ''
  switch (true) {
    case expirationInterval.value > 10:
      backgroundColor = 'bg-green'
      break

    case expirationInterval.value < 0:
      backgroundColor = 'bg-dark-1'
      break

    case expirationInterval.value < 10 && expirationInterval.value > 3 :
      backgroundColor = 'bg-amber'
      break

    case expirationInterval.value < 3 && expirationInterval.value > 0:
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
            {{ localStockData.quantity }} {{ stockData.unit }}
          </div>
          <div id="expiration-date-block" flex self-center text-5>
            <div m-r-4 self-end text-4>
              date d'expiration
            </div>
            {{ convertedDate }} {{ expirationInterval }}
          </div>
        </div>
      </NCard>
      <div id="expiration-date-indicator" w-8 rounded-r-2xl :class="backgroundExpiration" />
    </div>
    <div id="button-menu" flex gap-3>
      <NButton type="success" circle disabled text-green @click="editStock()">
        <div i-fluent:edit-20-regular />
      </NButton>
      <NButton circle type="error" text-red @click="deleteStock()">
        <div i-fluent:delete-24-regular />
      </NButton>
    </div>
  </div>
  <StockBlockEdit v-if="showEditStockBlock" :stock-data="localStockData" />
</template>

<style scoped>

</style>
