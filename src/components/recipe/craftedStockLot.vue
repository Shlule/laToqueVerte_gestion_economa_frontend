<script setup lang="ts">
import type { DropdownOption } from 'naive-ui'
import type { CraftedStock, StockMovementInput, StockMovementKind } from '~/types'
import { useQueryClient } from '@tanstack/vue-query'
import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { NButton, NDropdown, NInput, NInputNumber, NRadioButton, NRadioGroup, useDialog } from 'naive-ui'
import { addStockMovement, deleteCraftedStock, setCraftedStockArchived } from '~/composables/apiService'

// Un lot de préparation : ce qui reste, et les actions du quotidien
// (vendre, déclarer une perte, faire l'inventaire, masquer), avec l'historique des mouvements.

const props = defineProps<{ stock: CraftedStock }>()

const { t } = useI18n()
const dialog = useDialog()
const queryClient = useQueryClient()

const remaining = computed(() => Number(props.stock.quantity))
const initial = computed(() => Number(props.stock.initialQuantity ?? props.stock.quantity))
const progress = computed(() => initial.value
  ? Math.max(0, Math.min(1, remaining.value / initial.value))
  : 0)

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
const daysLeft = computed(() => props.stock.expirationDate
  ? differenceInCalendarDays(parseISO(props.stock.expirationDate), new Date())
  : null)
const freshnessClass = computed(() => {
  const left = daysLeft.value
  if (props.stock.archived)
    return 'bg-gray-300 dark:bg-gray-600'
  if (left === null)
    return 'bg-gray-400'
  if (left < 0)
    return 'bg-dark-1'
  if (left < 2)
    return 'bg-red-500'
  if (left < 5)
    return 'bg-amber'
  return 'bg-green-500'
})

async function refresh() {
  await Promise.all(['craftedStocks', 'insufficientSubRecipes'].map(key => queryClient.invalidateQueries({
    queryKey: [key],
  })))
}

// ANCHOR - vente / perte / inventaire
type ActionKind = StockMovementInput['kind']
const formKind = ref<ActionKind | null>(null)
const formQuantity = ref<number | null>(1)
const formNote = ref('')
const formError = ref('')
const saving = ref(false)

function openForm(kind: ActionKind) {
  formKind.value = kind
  formQuantity.value = kind === 'adjustment'
    ? remaining.value
    : 1
  formNote.value = ''
  formError.value = ''
}

async function submit() {
  if (!formKind.value || formQuantity.value == null)
    return
  saving.value = true
  try {
    await addStockMovement(props.stock.id, {
      kind: formKind.value,
      quantity: formQuantity.value,
      note: formNote.value.trim(),
    })
    formKind.value = null
    await refresh()
  }
  catch (e) {
    formError.value = e instanceof Error
      ? e.message
      : String(e)
  }
  finally {
    saving.value = false
  }
}

// ANCHOR - menu
const menuOptions = computed<DropdownOption[]>(() => [
  {
    key: 'waste',
    label: t('stock-lot.waste'),
  },
  {
    key: 'adjustment',
    label: t('stock-lot.adjustment'),
  },
  { type: 'divider', key: 'd1' },
  {
    key: 'archive',
    label: props.stock.archived
      ? t('stock-lot.unarchive')
      : t('stock-lot.archive'),
  },
  {
    key: 'delete',
    label: t('stock-lot.delete'),
    props: { style: 'color: #d03050' },
  },
])

async function onMenu(key: string) {
  if (key === 'waste' || key === 'adjustment')
    return openForm(key)
  if (key === 'archive') {
    await setCraftedStockArchived(props.stock.id, !props.stock.archived)
    return refresh()
  }
  if (key === 'delete') {
    dialog.warning({
      title: t('stock-lot.delete'),
      content: t('stock-lot.delete_confirm'),
      positiveText: t('stock-lot.delete'),
      negativeText: t('button.cancel'),
      onPositiveClick: async () => {
        await deleteCraftedStock(props.stock.id)
        await refresh()
      },
    })
  }
}

// ANCHOR - historique
const showHistory = ref(false)
const kindLabels = computed<Record<StockMovementKind, string>>(() => ({
  sold: t('stock-lot.kind.sold'),
  waste: t('stock-lot.kind.waste'),
  used: t('stock-lot.kind.used'),
  adjustment: t('stock-lot.kind.adjustment'),
}))
</script>

<template>
  <li flex flex-col gap-1 :class="stock.archived ? 'opacity-60' : ''">
    <div flex overflow-hidden rounded-xl shadow-sm bg="gray-500/6">
      <div flex flex-1 flex-col gap-1 px-3 py-2>
        <!-- quantité restante / fabriquée -->
        <div flex items-baseline justify-between gap-2>
          <span text-lg>
            {{ qty(remaining) }}<span v-if="initial !== remaining" text-sm opacity-60> / {{ qty(initial) }}</span>
            {{ unitLabel(stock.unit, remaining || initial) }}
          </span>
          <span flex items-center gap-2 text-xs>
            <span v-if="stock.archived" rounded-full px-2 py-0.5 bg="gray-500/15">
              {{ remaining > 0 ? t('stock-lot.hidden') : t('stock-lot.empty') }}
            </span>
            <span v-if="stock.lotNumber" opacity-70>{{ t('stock-block.lot_number') }} {{ stock.lotNumber }}</span>
          </span>
        </div>
        <div h-1 overflow-hidden rounded-full bg="gray-500/15">
          <div h-full bg-teal-500 :style="{ width: `${progress * 100}%` }" />
        </div>
        <div flex flex-wrap gap-x-3 text-xs opacity-70>
          <span>{{ t('produce.made_on') }} {{ day(stock.creationDate) }}</span>
          <span v-if="stock.expirationDate">
            {{ t('produce.best_before') }} {{ day(stock.expirationDate) }}
            <template v-if="!stock.archived">({{ t('produce.days_left', { count: daysLeft }) }})</template>
          </span>
        </div>

        <!-- actions -->
        <div mt-1 flex flex-wrap items-center gap-2>
          <NButton v-if="!stock.archived && remaining > 0" size="small" type="primary" secondary @click="openForm('sold')">
            <div i-carbon-shopping-cart mr-1 />{{ t('stock-lot.sell') }}
          </NButton>
          <NButton v-if="stock.movements?.length" size="small" quaternary @click="showHistory = !showHistory">
            {{ t('stock-lot.history', { count: stock.movements.length }) }}
            <div :class="showHistory ? 'i-carbon-chevron-up' : 'i-carbon-chevron-down'" ml-1 />
          </NButton>
          <NDropdown trigger="click" :options="menuOptions" @select="onMenu">
            <NButton size="small" quaternary circle ml-auto :title="t('stock-lot.more')">
              <div i-carbon-overflow-menu-horizontal />
            </NButton>
          </NDropdown>
        </div>

        <!-- formulaire de mouvement -->
        <div v-if="formKind" mt-1 flex flex-col gap-2 rounded-lg p-2 bg="teal-500/8">
          <NRadioGroup v-model:value="formKind" size="small">
            <NRadioButton value="sold">
              {{ t('stock-lot.kind.sold') }}
            </NRadioButton>
            <NRadioButton value="waste">
              {{ t('stock-lot.kind.waste') }}
            </NRadioButton>
            <NRadioButton value="adjustment">
              {{ t('stock-lot.kind.adjustment') }}
            </NRadioButton>
          </NRadioGroup>
          <div flex flex-wrap items-center gap-2>
            <span text-sm>{{ formKind === 'adjustment' ? t('stock-lot.counted') : t('stock-lot.how_many') }}</span>
            <NInputNumber v-model:value="formQuantity" :min="0" :max="formKind === 'adjustment' ? undefined : remaining" size="small" autofocus w-8rem @keydown.enter="submit" />
            <span text-sm opacity-70>{{ unitLabel(stock.unit, 2) }}</span>
          </div>
          <NInput v-model:value="formNote" size="small" :placeholder="t('stock-lot.note')" @keydown.enter="submit" />
          <p v-if="formError" text-xs text-red>
            {{ formError }}
          </p>
          <div flex justify-end gap-2>
            <NButton size="small" quaternary @click="formKind = null">
              {{ t('button.cancel') }}
            </NButton>
            <NButton size="small" type="primary" :loading="saving" :disabled="formQuantity == null" @click="submit">
              {{ t('button.confirm') }}
            </NButton>
          </div>
        </div>
      </div>
      <div w-2 :class="freshnessClass" />
    </div>

    <!-- historique du lot -->
    <ul v-if="showHistory" ml-3 flex flex-col gap-0.5 border-l="2 gray-500/20" pl-3 text-xs>
      <li v-for="movement in stock.movements" :key="movement.id" flex gap-2>
        <span w-5rem shrink-0 opacity-60>{{ day(movement.date) }}</span>
        <span w-8rem shrink-0>{{ kindLabels[movement.kind] }}</span>
        <span w-4rem shrink-0 text-right font-mono>{{ Number(movement.quantity) > 0 ? '−' : '+' }}{{ qty(Math.abs(Number(movement.quantity))) }}</span>
        <span truncate opacity-70>{{ movement.note }}</span>
      </li>
    </ul>
  </li>
</template>
