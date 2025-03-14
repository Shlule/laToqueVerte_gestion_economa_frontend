<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { NButton, NCollapseTransition, NSpin } from 'naive-ui'
import { useStockStore } from '~/stores/stock'
import type { Ingredient } from '~/types'

const ingredientData = defineModel<Ingredient>('ingredientData', { required: true })

const { t } = useI18n()
const [showStockList, toggleShowStockList] = useToggle()
const [isCreateStocks, toggleShowCreateStock] = useToggle()
const { resetStockForm } = useStockStore()

const stockStore = useStockStore()

const isEditIngredient = ref<boolean>(false)
const showIngredientBlock = ref(true)

// refresh data directly on the pinia store (the source of truth)
const { error: stockQueryError, isLoading: stockQueryLoading } = useQuery({
  queryKey: ['stocks', ingredientData.value.id],
  queryFn: async () => {
    const response = await getAllStocksByIngredient(ingredientData.value.id)
    if (!response) {
      return
    }
    stockStore.setStocks(ingredientData.value.id, response)
    return response
  },
  enabled: showStockList,
})

const stocksList = computed(() => {
  return stockStore.getStocks(ingredientData.value.id)
})

const totalQuantity = computed(() => {
  if (!stocksList.value) {
    return 0
  }
  const total = stocksList.value.reduce((sum, stock) => {
    const currentQuantity = stock.unit === ingredientData.value.unitType
      ? stock.quantity
      : convertUnit(stock.quantity, stock.unit, ingredientData.value.unitType)
    return sum + Number(currentQuantity)
  }, 0)

  return Number(total.toFixed(3))
})

const totalPrice = computed(() => {
  if (!totalQuantity.value) {
    return
  }
  return (totalQuantity.value * ingredientData.value.pricePerUnit).toFixed(2)
})

const isNoStock = computed(() => {
  if (stocksList.value?.length === 0) {
    return true
  }
  else {
    return false
  }
})

function toggleEditIngredient() {
  showIngredientBlock.value = !showIngredientBlock.value
  isEditIngredient.value = !isEditIngredient.value
}
function deleteIngredient() {
  const { error } = removeIngredient(ingredientData.value.id)
  if (error.value) {
    console.error(error)
  }

  showIngredientBlock.value = !showIngredientBlock.value
}

watch(isCreateStocks, (newX) => {
  if (newX === false) {
    resetStockForm()
  }
})
</script>

<template>
  <div w-full flex flex-col gap-2>
    <IngredientDisplay v-if="showIngredientBlock" :ingredient-data="ingredientData" @click="toggleShowStockList()">
      <NButton circle type="success" text-green @click.stop @click="toggleEditIngredient()">
        <div i-fluent:edit-20-filled />
      </NButton>
      <NButton circle type="error" text-red @click.stop @click="deleteIngredient()">
        <div i-fluent:delete-24-regular />
      </NButton>
    </IngredientDisplay>
    <FadeSlideTransition>
      <IngredientBlockEdit v-if="isEditIngredient" :ingredient-data="ingredientData" @toggle-edit-ingredient-block="toggleEditIngredient" />
    </FadeSlideTransition>
    <NCollapseTransition id="stockBlock-container" :show="showStockList" flex flex-col>
      <div id="stockBlock-header" flex flex-col items-center gap-2>
        <div v-if="isNoStock" text-6>
          {{ t('stock-header.no_stock') }} {{ ingredientData.name }}
        </div>
        <div v-else-if="stockQueryError">
          {{ stockQueryError }}
        </div>
        <div v-else-if="stockQueryLoading" flex>
          <p> {{ t('loading.query') }}</p>
          <NSpin />
        </div>
        <div v-else w-full flex justify-between gap-2>
          <div text-9>
            {{ t('stock-header.stock') }} {{ ingredientData.name }}
          </div>
          <div flex flex-col items-center gap-1>
            <p text-6>
              total
            </p>
            <div flex items-center gap-2>
              <p> {{ t('stock-header.total_price') }}:</p>
              <div text-6>
                {{ totalPrice }}€
              </div>
              <p> {{ t('stock-header.total_quantity') }}:</p>
              <div text-6>
                {{ totalQuantity }} {{ ingredientData.unitType }}
              </div>
            </div>
          </div>
        </div>
        <NButton round @click="toggleShowCreateStock()">
          {{ t('button.add_stock') }}
        </NButton>
      </div>
      <NScrollbar max-h-17rem>
        <StockBlock v-for="stock in stocksList" :key="stock.id" :stock-data="stock" :ingredient-id="ingredientData.id" />
      </NScrollbar>
    </NCollapseTransition>
    <NModal v-model:show="isCreateStocks">
      <CreateStock v-model:show-create-stock="isCreateStocks" :ingredient-id="ingredientData.id" />
    </NModal>
  </div>
</template>

<style scoped>

</style>
