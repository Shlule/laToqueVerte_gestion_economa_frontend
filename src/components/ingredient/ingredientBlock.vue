<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { NButton, NCard, NCollapseTransition } from 'naive-ui'
import economa_backend_api from '~/composables/apiService'
import { useStockStore } from '~/stores/stock'
import type { Ingredient, Stock } from '~/types'

const { ingredientData } = defineModels<{ ingredientData: Ingredient }>()

const { t } = useI18n()
const [showCollapse, toggleShowCollapse] = useToggle()
const [isCreateStocks, toggleShowCreateStock] = useToggle()
const { resetStockForm } = useCreateStockStore()
// const { data: stocksList } = getAllStocks(ingredientData.value.id)

const stockStore = useStockStore()

const stocksList = computed(() => {
  return stockStore.getStocks(ingredientData.value.id)
})

const mustUpdateStockList = ref<boolean>(false)
const isEditIngredient = ref<boolean>(false)
const showIngredientBlock = ref(true)

provide('mustUpdateStocksList', mustUpdateStockList)

function convertUnit(quantity: number, fromUnit: string, toUnit: string): number {
  const conversionRates = {
    kg: { g: 1000, kg: 1 },
    g: { g: 1, kg: 0.001 },
    unit: { unit: 1 },
  }

  return quantity * conversionRates[fromUnit][toUnit]
}

const { data: stockData } = useQuery({
  queryKey: ['stocks', ingredientData.value.id],
  queryFn: async () => {
    const response = await getAllStocksByIngredient(ingredientData.value.id)
    if (!response) {
      return
    }
    stockStore.setStocks(ingredientData.value.id, response)
    return response
  },
  enabled: showCollapse,
})

function showStockList() {
  toggleShowCollapse()
}

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

function deleteIngredient() {
  showIngredientBlock.value = false
  economa_backend_api.delete(`/ingredients/${ingredientData.value.id}`)
}

function toggleEditIngredient() {
  isEditIngredient.value = !isEditIngredient.value
  showIngredientBlock.value = !showIngredientBlock.value
}

// EDIT_STOCK[epic=edit_stock] - this part is for update info when stock is edited

async function updateStocksList(ingredientId: string) {
  const { data, error, execute } = await getAllStocks(ingredientId)
  execute().then(() => {
    if (!error.value) {
      stocksList.value = data.value
    }
    else {
      console.error('Error fetching stocks data:', error.value)
    }
  })

  // reset possibility to refresh data
  mustUpdateStockList.value = false
}

watch(mustUpdateStockList, (newValue) => {
  if (newValue === true) {
    updateStocksList(ingredientData.value.id)
  }
})

// !EDIT_STOCK

watch(isCreateStocks, (newX) => {
  if (newX === false) {
    resetStockForm()
  }
})
function addStock(newStock: Stock) {
  if (!stocksList.value) {
    return
  }
  stocksList.value = [...stocksList.value, newStock]
}
</script>

<template>
  <div grid w-full flex flex-col gap-2>
    <NCard v-if="showIngredientBlock" :bordered="false" class="transition-all active:scale-102" flex cursor-pointer rounded-2xl shadow-lg dark:ncard-dark hover:shadow-2xl>
      <div h-full w-full flex items-center justify-between @click="showStockList()">
        <div flex gap-2>
          <div text-3xl>
            {{ ingredientData.name }}
          </div>
          <div self-end>
            de "{{ ingredientData.fournisseur }}" {{ stockData }}
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
          <NButton circle type="success" text-green @click.stop @click="toggleEditIngredient()">
            <div i-fluent:edit-20-filled />
          </NButton>
          <NButton circle type="error" text-red @click.stop @click="deleteIngredient()">
            <div i-fluent:delete-24-regular />
          </NButton>
        </div>
      </div>
    </NCard>
    <ingredientBlockEdit v-if="isEditIngredient" :ingredient-data="ingredientData" @toggle-edit-ingredient-block="toggleEditIngredient" />
    <NCollapseTransition id="stockBlock-container" :show="showCollapse" flex flex-col>
      <div id="stockBlock-header" flex flex-col items-center gap-2>
        <div v-if="isNoStock" text-6>
          {{ t('stock-header.no_stock') }} {{ ingredientData.name }}
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
        <StockBlock v-for="stock in stocksList" :key="stock.id" :stock-data="stock" />
      </NScrollbar>
    </NCollapseTransition>
    <NModal v-model:show="isCreateStocks">
      <CreateStock v-model:show-create-stock="isCreateStocks" :ingredient-id="ingredientData.id" @stock-created="addStock" />
    </NModal>
  </div>
</template>

<style scoped>

</style>
