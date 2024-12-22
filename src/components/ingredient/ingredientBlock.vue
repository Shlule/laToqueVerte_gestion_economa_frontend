<script setup lang="ts">
import { NCard, NCollapseTransition } from 'naive-ui'
import economa_backend_api from '~/composables/apiService'
import type { Ingredient } from '~/types'

const props = defineProps<{ ingredientData: Ingredient }>()
const ingredientData = useVModel(props, 'ingredientData')
const [showCollapse, toggleShowCollapse] = useToggle()
const [isCreateStocks, toggleShowCreateStock] = useToggle()
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
          <NButton circle type="success" text-green @click.stop>
            <div i-fluent:edit-20-filled />
          </NButton>
          <NButton circle type="error" text-red @click.stop @click="deleteIngredient()">
            <div i-fluent:delete-24-regular />
          </NButton>
        </div>
      </div>
    </NCard>
    <NCollapseTransition id="stockBlock-container" :show="showCollapse" flex flex-col>
      <div id="stockBlock-header" w-full flex flex-col items-center gap-2>
        <div v-if="isNoStock" text-6>
          Vous n'avez pas de stocks de {{ ingredientData.name }}
        </div>
        <div v-else self-baseline text-8>
          Stocks de {{ ingredientData.name }}
        </div>
        <NButton round @click="toggleShowCreateStock()">
          Add Stock
        </NButton>
      </div>
      <NScrollbar max-h-17rem>
        <StockBlock v-for="stock in stocksData" :key="stock.id" :stock-data="stock" />
      </NScrollbar>
    </NCollapseTransition>
    <NModal v-model:show="isCreateStocks">
      <CreateStock v-model:show-create-stock="isCreateStocks" />
    </NModal>
  </div>
</template>

<style scoped>

</style>
