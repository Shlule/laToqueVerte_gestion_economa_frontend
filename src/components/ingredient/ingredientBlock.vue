<script setup lang="ts">
import { NCard, NCollapseTransition } from 'naive-ui'
import type { Ingredient } from '~/types'

const props = defineProps<{ ingredientData: Ingredient }>()
const ingredientData = useVModel(props, 'ingredientData')
const [showCollapse, toggleShowCollapse] = useToggle()
const { data: stocksData } = getAllStocks(ingredientData.value.id)
</script>

<template>
  <div w-full flex flex-col gap-2>
    <NCard :bordered="false" class="transition-all active:scale-102" flex cursor-pointer rounded-2xl dark:ncard-dark light:ncard-light>
      <div h-full w-full flex items-center justify-between @click="toggleShowCollapse()">
        <div flex gap-2>
          <div text-3xl>
            {{ ingredientData.name }}
          </div>
          <div self-end>
            de "{{ ingredientData.fournisseur }}"
          </div>
        </div>
        <div flex gap-2>
          <div text-3xl>
            {{ ingredientData.pricePerUnit }}€
          </div>
          <p text-lg>
            per {{ ingredientData.unitType }}
          </p>
        </div>
        <NButton circle type="error" text-red @click.stop>
          <div i-fluent:delete-24-regular />
        </NButton>
      </div>
    </NCard>
    <NCollapseTransition :show="showCollapse">
      <div m-l-8 text-align-start text-8>
        Stocks de {{ ingredientData.name }}
      </div>
      <NScrollbar max-h-17rem>
        <StockBlock v-for="stock in stocksData" :key="stock.id" :stock-data="stock" />
      </NScrollbar>
    </NCollapseTransition>
  </div>
</template>

<style scoped>

</style>
