<script setup lang="ts">
import { NCard, NCollapseTransition } from 'naive-ui'
import economa_backend_api from '~/composables/apiService'
import type { Ingredient } from '~/types'

const props = defineProps<{ ingredientData: Ingredient }>()
const ingredientData = useVModel(props, 'ingredientData')
const [showCollapse, toggleShowCollapse] = useToggle()
const [showCreateStock, toggleShowCreateStock] = useToggle()
const { data: stocksData } = getAllStocks(ingredientData.value.id)
const isNoStock = computed(() => {
  if (stocksData.value?.length === 0) {
    return true
  }
  else {
    return false
  }
})
const showIngredientBlock = ref(true)
function deleteIngredient() {
  showIngredientBlock.value = false
  economa_backend_api.delete(`/ingredients/${ingredientData.value.id}`)
}
</script>

<template>
  <div grid w-full flex flex-col gap-2>
    <NCard v-if="showIngredientBlock" :bordered="false" class="transition-all active:scale-102" flex cursor-pointer rounded-2xl shadow-lg dark:ncard-dark hover:shadow-2xl>
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
    <NCollapseTransition v-if="isNoStock" :show="showCollapse">
      <div text-8>
        vous n'avez pas de stock
      </div>
    </NCollapseTransition>
    <NCollapseTransition v-else id="stockBlock-container" :show="showCollapse">
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
