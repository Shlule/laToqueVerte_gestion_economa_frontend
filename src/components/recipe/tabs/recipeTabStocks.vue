<script setup lang="ts">
import type { Recipe } from '~/types'
import { useQuery } from '@tanstack/vue-query'
import { NButton, NEmpty, NScrollbar, NSpin, NSwitch } from 'naive-ui'
import { getCraftedStocksByRecipe } from '~/composables/apiService'

// Onglet « Stocks » d'une recette : les lots fabriqués, ce qu'il en reste,
// et sur demande l'historique (lots épuisés ou masqués, jamais supprimés automatiquement).

const props = defineProps<{ recipe: Recipe }>()
const emit = defineEmits<{ produce: [] }>()

const { t } = useI18n()
const showArchived = ref(false)

const { data: stocks, isLoading } = useQuery({
  queryKey: ['craftedStocks', props.recipe.id, showArchived],
  queryFn: async () => await getCraftedStocksByRecipe(props.recipe.id, showArchived.value) ?? [],
})

// lots en cours d'abord, l'historique ensuite
const sortedStocks = computed(() => [
  ...(stocks.value ?? []),
].sort((a, b) => Number(!!a.archived) - Number(!!b.archived)))

const total = computed(() => (stocks.value ?? [])
  .filter(stock => !stock.archived)
  .reduce((sum, stock) => sum + Number(stock.quantity), 0))

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
    <div flex items-center gap-2 text-sm>
      <NSwitch v-model:value="showArchived" size="small" />
      <span cursor-pointer select-none @click="showArchived = !showArchived">{{ t('stock-lot.show_archived') }}</span>
    </div>

    <NSpin v-if="isLoading" />
    <NEmpty v-else-if="!stocks?.length" size="small" :description="t('produce.no_stock')" />
    <NScrollbar v-else max-h-22rem>
      <ul flex flex-col gap-2 pr-2>
        <CraftedStockLot v-for="stock in sortedStocks" :key="stock.id" :stock="stock" />
      </ul>
    </NScrollbar>
  </div>
</template>
