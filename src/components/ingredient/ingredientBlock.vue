<script setup lang="ts">
import { NCard, NCollapseTransition } from 'naive-ui'
import economa_backend_api from '~/composables/apiService'
import type { Ingredient } from '~/types'

const props = defineProps<{ ingredientData: Ingredient }>()
const ingredientData = useVModel(props, 'ingredientData')
const [showCollapse, toggleShowCollapse] = useToggle()
const [showCreateStock, toggleShowCreateStock] = useToggle()
const { data: stocksData } = getAllStocks(ingredientData.value.id)
function deleteIngredient() {
  economa_backend_api.delete(`/ingredients/${ingredientData.value.id}`)
}
</script>

<template>
  <div w-full flex flex-col gap-2>
    <NCard :bordered="false" class="transition-all active:scale-102" flex cursor-pointer rounded-2xl bg-stone-1 shadow-lg active:bg-stone-3 dark:ncard-dark hover:bg-stone-2 hover:shadow-2xl>
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
        <div id="button-menu" flex gap-4>
          <NButton circle type="success" text-green @click.stop @click="toggleShowCreateStock()">
            <div i-fluent:add-20-filled />
          </NButton>
          <NButton circle type="error" text-red @click.stop @click="deleteIngredient()">
            <div i-fluent:delete-24-regular />
          </NButton>
        </div>
      </div>
    </NCard>
    <NCollapseTransition id="stockBlock-container" :show="showCollapse">
      <div id="stockBlock-header" flex items-center justify-between>
        <div m-l-8 text-align-start text-8>
          Stocks de {{ ingredientData.name }}
        </div>
      </div>
      <NScrollbar max-h-17rem>
        <StockBlock v-for="stock in stocksData" :key="stock.id" :stock-data="stock" />
      </NScrollbar>
    </NCollapseTransition>
    <CreateStock :show-create-stock="showCreateStock" />
  </div>
</template>

<style scoped>

</style>
