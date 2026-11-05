<script setup lang="ts">
import type { Recipe } from '~/types'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { NButton, NEmpty, NPopconfirm, NScrollbar, NSpin } from 'naive-ui'
import { deleteCraftedStock, getCraftedStocksByRecipe } from '~/composables/apiService'

// Onglet « Stocks » d'une recette : les fournées déjà réalisées (lot, dates, quantité).

const props = defineProps<{ recipe: Recipe }>()
const emit = defineEmits<{ produce: [] }>()

const { t } = useI18n()
const queryClient = useQueryClient()

const { data: stocks, isLoading } = useQuery({
  queryKey: ['craftedStocks', props.recipe.id],
  queryFn: async () => await getCraftedStocksByRecipe(props.recipe.id) ?? [],
})

const total = computed(() => (stocks.value ?? []).reduce((sum, stock) => sum + Number(stock.quantity), 0))

function unitLabel(value: string, count = 1) {
  if (value !== 'unit')
    return value
  return count > 1
    ? t('produce.pieces')
    : t('recipe-wizard.unit_piece')
}
function qty(value: number) {
  return Number(value).toLocaleString('fr-FR', { maximumFractionDigits: 3 })
}
function day(value: string) {
  return format(parseISO(value), 'dd/MM/yyyy')
}
function daysLeft(value?: string | null) {
  return value
    ? differenceInCalendarDays(parseISO(value), new Date())
    : null
}
function freshnessClass(value?: string | null) {
  const left = daysLeft(value)
  if (left === null)
    return 'bg-gray-400'
  if (left < 0)
    return 'bg-dark-1'
  if (left < 2)
    return 'bg-red-500'
  if (left < 5)
    return 'bg-amber'
  return 'bg-green-500'
}

async function remove(stockId: string) {
  await deleteCraftedStock(stockId)
  await Promise.all(['craftedStocks', 'insufficientSubRecipes'].map(key => queryClient.invalidateQueries({
    queryKey: [key],
  })))
}
</script>

<template>
  <div flex flex-col gap-3 py-2 text-left>
    <div flex items-center justify-between gap-2>
      <div>
        <span text-sm opacity-70>{{ t('produce.total') }}</span>
        <span ml-2 text-xl>{{ qty(total) }} {{ unitLabel(recipe.unitType, total) }}</span>
      </div>
      <NButton type="primary" round @click="emit('produce')">
        <div i-carbon-restaurant mr-2 />
        {{ t('produce.button') }}
      </NButton>
    </div>

    <NSpin v-if="isLoading" />
    <NEmpty v-else-if="!stocks?.length" size="small" :description="t('produce.no_stock')" />
    <NScrollbar v-else max-h-16rem>
      <ul flex flex-col gap-2 pr-2>
        <li v-for="stock in stocks" :key="stock.id" flex items-stretch gap-2>
          <div flex flex-1 overflow-hidden rounded-xl shadow-sm bg="gray-500/6">
            <div flex-1 px-3 py-2>
              <div flex items-baseline justify-between gap-2>
                <span text-lg>{{ qty(stock.quantity) }} {{ unitLabel(stock.unit, Number(stock.quantity)) }}</span>
                <span v-if="stock.lotNumber" text-xs opacity-70>{{ t('stock-block.lot_number') }} {{ stock.lotNumber }}</span>
              </div>
              <div flex flex-wrap gap-x-3 text-xs opacity-70>
                <span>{{ t('produce.made_on') }} {{ day(stock.creationDate) }}</span>
                <span v-if="stock.expirationDate">
                  {{ t('produce.best_before') }} {{ day(stock.expirationDate) }}
                  ({{ t('produce.days_left', { count: daysLeft(stock.expirationDate) }) }})
                </span>
              </div>
            </div>
            <div w-2 :class="freshnessClass(stock.expirationDate)" />
          </div>
          <NPopconfirm @positive-click="remove(stock.id)">
            <template #trigger>
              <NButton type="error" circle self-center text-red :title="t('recipeIngredient-block.delete')">
                <div i-fluent:delete-24-regular />
              </NButton>
            </template>
            {{ t('produce.delete_confirm') }}
          </NPopconfirm>
        </li>
      </ul>
    </NScrollbar>
  </div>
</template>
