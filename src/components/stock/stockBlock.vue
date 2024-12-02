<script setup lang="ts">
import { NCard } from 'naive-ui'
import { format } from 'date-fns'
import type { Stock } from '~/types'

const props = defineProps<{ stockData: Stock }>()
const stockData = useVModel(props, 'stockData')
// const convertedDate = computed(() => {
//   const expirationDate = stockData.value?.expirationDate
//   return expirationDate ? parseISO(expirationDate.toString()) : null
// })
const convertedDate = computed(() => {
  const expirationDate = stockData.value?.expirationDate
  return expirationDate ? format(expirationDate, 'P') : null
})
</script>

<template>
  <div id="stock-container" m-y-3 w-full flex items-center gap-2>
    <div id="stock-card-container" w-full flex>
      <NCard :bordered="false" flex rounded-l-2xl p-0 shadow-xl>
        <div h-full flex justify-between>
          <div align-center text-6>
            {{ stockData.quantity }} {{ stockData.unit }}
          </div>
          <div id="expiration-date-block" flex self-center text-5>
            <div m-r-4 self-end text-4>
              date d'expiration
            </div>
            {{ convertedDate }}
          </div>
        </div>
      </NCard>
      <div id="expiration-date-indicator" w-8 rounded-r-2xl bg-red />
    </div>
    <div id="button-menu" flex>
      <NButton circle type="error" text-red @click.stop>
        <div i-fluent:delete-24-regular />
      </NButton>
      <div>
        bonjour
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
