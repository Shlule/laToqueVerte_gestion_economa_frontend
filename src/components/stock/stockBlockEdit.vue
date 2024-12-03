<script setup lang="ts">
import type { Stock } from '~/types'

const props = defineProps<{ stockData: Stock }>()
const emit = defineEmits(['update:stockData'])

const stockData = useVModel(props, 'stockData', emit)
function confirm() {
  stockData.value.quantity = 2.0
}

// const temporaryStockData = stockData.value
</script>

<template>
  <div id="stockEdit-container" m-y-3 w-full flex items-center gap-2>
    <div id="stockEdit-card-container" w-full flex>
      <NCard :bordered="false" flex rounded-2xl p-0 shadow-xl>
        <div h-full flex justify-between>
          <div align-center text-6>
            {{ stockData.quantity }} {{ stockData.unit }}
          </div>
          <div id="expiration-date-block" flex self-center text-5>
            <div m-r-4 self-end text-4>
              date d'expiration
            </div>
          </div>
        </div>
      </NCard>
    </div>
    <div id="button-menu" flex gap-3>
      <NButton circle type="success" text-green @click="confirm()">
        <div i-fluent:checkmark-20-regular />
      </NButton>
      <!-- <NButton circle type="error" text-red @click="cancel()">
        <div i-material-symbols:close-rounded />
      </NButton> -->
    </div>
  </div>
</template>

<style scoped>

</style>
