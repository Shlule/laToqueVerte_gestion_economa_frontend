<script setup lang="ts">
import type { PricingMode, Recipe } from '~/types'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { NButton, NInputNumber, NModal, NSelect, NSpin, NTag, useNotification } from 'naive-ui'
import { getRecipePricing, patchRecipe } from '~/composables/apiService'
import { formatDuration } from '~/composables/cooking'
import { formatPrice } from '~/composables/money'
import { computeSellingPrice, DEFAULT_VALUES, PRICING_MODES, VAT_RATES } from '~/composables/pricing'

// Onglet « économat » : coût de revient détaillé (matières, énergie du four, main d'œuvre)
// et prix de vente selon une formule conseillée ou choisie pour la recette.

const { recipeData } = defineProps<{ recipeData: Recipe }>()

const { t } = useI18n()
const notification = useNotification()
const queryClient = useQueryClient()

const { data: pricing, isLoading } = useQuery({
  // le coût change quand un prix d'ingrédient change : on le met dans la clé
  queryKey: [
    'recipePricing',
    recipeData.id,
    () => recipeData.cost,
  ],
  queryFn: () => getRecipePricing(recipeData.id),
})

const breakdown = computed(() => pricing.value?.breakdown)

// ANCHOR - unités de calcul : la pièce, ou le kg / les 100 g / le g, et la part si on l'a renseignée
interface Divisor { key: string, label: string, short: string, divisor: number, digits: number }
const divisors = computed<Divisor[]>(() => {
  const quantity = Number(recipeData.quantity)
  const list: Divisor[] = []
  if (recipeData.unitType === 'unit') {
    list.push({
      key: 'piece',
      short: t('pricing.unit_piece'),
      label: t('pricing.per_piece'),
      divisor: quantity,
      digits: 2,
    })
  }
  else {
    const kg = recipeData.unitType === 'kg'
      ? quantity
      : quantity / 1000
    list.push(
      {
        key: 'kg',
        short: 'kg',
        label: t('pricing.per_kg'),
        divisor: kg,
        digits: 2,
      },
      {
        key: '100g',
        short: '100 g',
        label: t('pricing.per_100g'),
        divisor: kg * 10,
        digits: 2,
      },
      {
        key: 'g',
        short: 'g',
        label: t('pricing.per_g'),
        divisor: kg * 1000,
        digits: 4,
      },
    )
  }
  if (recipeData.portions) {
    list.push({
      key: 'part',
      short: t('pricing.unit_portion'),
      label: t('pricing.per_portion'),
      divisor: recipeData.portions,
      digits: 2,
    })
  }
  return list.filter(d => d.divisor > 0)
})
/** Unité principale du tableau : la part si elle existe, sinon la pièce ou le kg. */
const main = computed(() => divisors.value.find(d => d.key === 'part') ?? divisors.value[0])
function per(amount: number | string, d: Divisor | undefined) {
  return d
    ? formatPrice(Number(amount) / d.divisor, d.digits)
    : '–'
}

/** Lignes du coût de revient. */
const rows = computed(() => {
  const b = breakdown.value
  if (!b)
    return []
  const total = Number(b.productionCost) || 1
  return [
    {
      key: 'materials',
      dot: 'bg-teal-500',
      amount: Number(b.materials),
    },
    {
      key: 'energy',
      dot: 'bg-amber-500',
      amount: Number(b.energy),
    },
    {
      key: 'labor',
      dot: 'bg-indigo-500',
      amount: Number(b.labor),
    },
  ].map(row => ({
    ...row,
    percent: Math.round(row.amount / total * 100),
  }))
})

// ANCHOR - temps (main d'œuvre et cuisson) et nombre de parts, modifiables ici
const editingTimes = ref(false)
const laborTime = ref<number | null>(null)
const cookingTime = ref<number | null>(null)
const portions = ref<number | null>(null)
function startEditTimes() {
  laborTime.value = recipeData.laborTime ?? null
  cookingTime.value = recipeData.cookingTime ?? null
  portions.value = recipeData.portions ?? null
  editingTimes.value = true
}
async function saveTimes() {
  await patchRecipe(recipeData.id, {
    laborTime: laborTime.value || null,
    cookingTime: cookingTime.value || null,
    portions: portions.value || null,
  })
  editingTimes.value = false
  await Promise.all([
    ['allRecipes'],
    ['recipePricing', recipeData.id],
  ].map(queryKey => queryClient.invalidateQueries({ queryKey })))
}

// ANCHOR - formule de prix
const mode = ref<PricingMode>('raw_coefficient')
const value = ref<number | null>(null)
const vatRate = ref<number>(5.5)
const dirty = ref(false)

watch(pricing, (data) => {
  if (!data || dirty.value)
    return
  mode.value = data.pricing.mode
  value.value = Number(data.pricing.value)
  vatRate.value = Number(data.pricing.vatRate)
}, { immediate: true })

const modeOptions = computed(() => PRICING_MODES.map(key => ({
  value: key,
  label: key === pricing.value?.recommended.mode
    ? `${t(`pricing.mode.${key}`)} · ${t('pricing.recommended')}`
    : t(`pricing.mode.${key}`),
})))
const vatOptions = VAT_RATES.map(rate => ({ value: rate, label: `${rate.toLocaleString('fr-FR')} %` }))

function onModeChange(next: PricingMode) {
  mode.value = next
  value.value = next === pricing.value?.recommended.mode
    ? Number(pricing.value.recommended.value)
    : DEFAULT_VALUES[next]
  dirty.value = true
}

const valueSuffix = computed(() => ({
  raw_coefficient: '×',
  cost_coefficient: '×',
  margin: '%',
  fixed: `€ TTC / ${recipeData.unitType === 'unit'
    ? t('recipe-wizard.unit_piece')
    : recipeData.unitType}`,
})[mode.value])

const selling = computed(() => {
  const b = breakdown.value
  if (!b || value.value == null)
    return null
  return computeSellingPrice(mode.value, value.value, vatRate.value, Number(b.materials), Number(b.productionCost), Number(recipeData.quantity))
})

const marginClass = computed(() => {
  const rate = selling.value?.marginRate
  if (rate == null)
    return ''
  return rate < 0
    ? 'text-red-600 dark:text-red-300'
    : rate < 30
      ? 'text-amber-600 dark:text-amber-300'
      : 'text-teal-700 dark:text-teal-300'
})

/** Ce qui reste après le coût de revient, pour une unité principale (HT). */
const marginPerMain = computed(() => selling.value && breakdown.value && main.value
  ? (selling.value.priceHT - Number(breakdown.value.productionCost)) / main.value.divisor
  : null)

/** Prix de vente pour la recette entière et par unité. */
const sellingTiles = computed(() => {
  const price = selling.value
  if (!price)
    return []
  return [
    ...divisors.value.map(d => ({
      key: d.key,
      label: d.label,
      ttc: formatPrice(price.priceTTC / d.divisor, d.digits),
      ht: formatPrice(price.priceHT / d.divisor, d.digits),
      highlight: d === main.value,
    })),
  ]
})

const qtyLabel = computed(() => {
  const quantity = Number(recipeData.quantity).toLocaleString('fr-FR', { maximumFractionDigits: 3 })
  const unit = recipeData.unitType === 'unit'
    ? t('produce.pieces')
    : recipeData.unitType
  return recipeData.portions
    ? `${quantity} ${unit} · ${t('pricing.portions_count', { count: recipeData.portions })}`
    : `${quantity} ${unit}`
})

const isRecommended = computed(() => !!pricing.value
  && mode.value === pricing.value.recommended.mode
  && value.value === Number(pricing.value.recommended.value)
  && vatRate.value === Number(pricing.value.recommended.vatRate))

const saving = ref(false)
async function savePricing(useRecommended = false) {
  saving.value = true
  try {
    await patchRecipe(recipeData.id, useRecommended
      ? { pricingMode: '', pricingValue: null, vatRate: null }
      : { pricingMode: mode.value, pricingValue: value.value, vatRate: vatRate.value })
    dirty.value = false
    await queryClient.invalidateQueries({
      queryKey: ['recipePricing', recipeData.id],
    })
    notification.success({
      title: t('pricing.saved'),
      duration: 2000,
    })
  }
  catch (e) {
    notification.error({
      title: t('pricing.error'),
      content: e instanceof Error
        ? e.message
        : String(e),
      duration: 4000,
    })
  }
  finally {
    saving.value = false
  }
}

const showSettings = ref(false)
</script>

<template>
  <div mt-2 flex flex-col gap-5 text-left>
    <NSpin v-if="isLoading" />
    <template v-else-if="breakdown && pricing">
      <!-- ============ coût de revient ============ -->
      <section flex flex-col gap-3>
        <div flex items-center justify-between gap-2>
          <h3 text-lg font-bold>
            {{ t('pricing.production_cost') }}
          </h3>
          <button icon-btn flex items-center gap-1 text-sm :title="t('pricing.settings')" @click="showSettings = true">
            <span i-carbon-settings-adjust />{{ t('pricing.settings') }}
          </button>
        </div>

        <!-- le coût par unité -->
        <div grid gap-2 :style="{ gridTemplateColumns: `repeat(${divisors.length}, minmax(0, 1fr))` }">
          <div v-for="d in divisors" :key="d.key" rounded-xl px-3 py-2 :bg="d === main ? 'teal-500/12' : 'gray-500/8'">
            <div text-xs opacity-70>
              {{ d.label }}
            </div>
            <div whitespace-nowrap text-lg font-semibold>
              {{ per(breakdown.productionCost, d) }}
            </div>
          </div>
        </div>

        <!-- d'où vient ce coût -->
        <table w-full text-sm>
          <thead text-xs opacity-60>
            <tr>
              <th text-left font-normal />
              <th text-right align-bottom font-normal>
                {{ t('pricing.whole_batch') }}<br><span whitespace-nowrap>{{ qtyLabel }}</span>
              </th>
              <th pl-3 text-right align-bottom font-normal>
                {{ main?.label }}
              </th>
              <th w-3rem text-right align-bottom font-normal>
                %
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.key" border-t="1 gray-500/15">
              <td py-1.5>
                <span mr-2 inline-block h-2 w-2 rounded-full :class="row.dot" />{{ t(`pricing.${row.key}`) }}
              </td>
              <td text-right>
                {{ formatPrice(row.amount) }}
              </td>
              <td text-right>
                {{ per(row.amount, main) }}
              </td>
              <td text-right opacity-60>
                {{ row.percent }} %
              </td>
            </tr>
            <tr border-t="2 gray-500/30" font-semibold>
              <td py-1.5>
                {{ t('pricing.total') }}
              </td>
              <td text-right>
                {{ formatPrice(breakdown.productionCost) }}
              </td>
              <td text-right>
                {{ per(breakdown.productionCost, main) }}
              </td>
              <td />
            </tr>
          </tbody>
        </table>

        <!-- comment c'est calculé -->
        <ul flex flex-col gap-0.5 text-xs opacity-60>
          <li>
            <span i-carbon-temperature-hot mr-1 inline-block align-middle />
            <template v-if="breakdown.cookingTime">
              {{ t('pricing.energy_detail', { time: formatDuration(breakdown.cookingTime), power: Number(pricing.settings.ovenPower).toLocaleString('fr-FR'), price: formatPrice(pricing.settings.electricityPrice, 4) }) }}
            </template>
            <template v-else>
              {{ t('pricing.no_cooking') }}
            </template>
          </li>
          <li>
            <span i-carbon-user-activity mr-1 inline-block align-middle />
            <template v-if="breakdown.laborTime">
              {{ t('pricing.labor_detail', { time: formatDuration(breakdown.laborTime), rate: formatPrice(pricing.settings.laborHourlyRate) }) }}
            </template>
            <template v-else>
              {{ t('pricing.no_labor') }}
            </template>
          </li>
          <li v-if="Number(breakdown.fromSubRecipes)">
            <span i-carbon-chart-relationship mr-1 inline-block align-middle />
            {{ t('pricing.from_sub_recipes', { amount: formatPrice(breakdown.fromSubRecipes) }) }}
          </li>
        </ul>

        <div v-if="!editingTimes">
          <NButton size="small" secondary @click="startEditTimes">
            <div i-carbon-edit mr-1 />{{ t('pricing.edit_times') }}
          </NButton>
        </div>
        <div v-else grid="~ cols-[auto_1fr]" items-center gap-x-3 gap-y-2 rounded-xl p-3 text-sm bg="gray-500/8">
          <span>{{ t('recipe-wizard.labor_time') }}</span>
          <NInputNumber v-model:value="laborTime" :min="0" size="small" w-9rem>
            <template #suffix>
              min
            </template>
          </NInputNumber>
          <span>{{ t('pricing.cooking') }}</span>
          <NInputNumber v-model:value="cookingTime" :min="0" size="small" w-9rem>
            <template #suffix>
              min
            </template>
          </NInputNumber>
          <span>{{ t('pricing.portions') }}</span>
          <div flex items-center gap-2>
            <NInputNumber v-model:value="portions" :min="0" size="small" w-9rem :placeholder="t('recipe-wizard.optional')" />
            <span text-xs opacity-60>{{ t('pricing.portions_help') }}</span>
          </div>
          <div col-span-2 flex justify-end gap-2>
            <NButton size="small" quaternary @click="editingTimes = false">
              {{ t('button.cancel') }}
            </NButton>
            <NButton size="small" type="primary" @click="saveTimes">
              {{ t('button.confirm') }}
            </NButton>
          </div>
        </div>
      </section>

      <!-- ============ prix de vente ============ -->
      <section flex flex-col gap-3 border-t="1 gray-500/15" pt-4>
        <div flex items-center justify-between gap-2>
          <h3 text-lg font-bold>
            {{ t('pricing.selling_price') }}
          </h3>
          <NTag size="small" round :type="isRecommended ? 'success' : 'default'">
            {{ isRecommended ? t('pricing.recommended_formula') : t('pricing.custom_formula') }}
          </NTag>
        </div>

        <!-- le résultat d'abord -->
        <div v-if="selling" grid gap-2 :style="{ gridTemplateColumns: `repeat(${divisors.length}, minmax(0, 1fr))` }">
          <div v-for="tile in sellingTiles" :key="tile.key" rounded-xl px-3 py-2 :bg="tile.highlight ? 'teal-500/12' : 'gray-500/8'">
            <div text-xs opacity-70>
              {{ tile.label }}
            </div>
            <div whitespace-nowrap text-lg font-semibold>
              {{ tile.ttc }}
            </div>
            <div text-xs opacity-60>
              TTC · {{ tile.ht }} HT
            </div>
          </div>
        </div>
        <p v-if="selling" text-sm opacity-80>
          {{ t('pricing.batch_price', { qty: qtyLabel, ttc: formatPrice(selling.priceTTC), ht: formatPrice(selling.priceHT) }) }}
        </p>
        <p v-if="selling" flex flex-wrap items-center gap-x-4 gap-y-1 text-sm>
          <span font-semibold :class="marginClass">
            {{ t('pricing.margin', { rate: selling.marginRate?.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) ?? '–' }) }}
            <template v-if="marginPerMain != null && main">
              · {{ t('pricing.margin_amount', { amount: formatPrice(marginPerMain), unit: main.short }) }}
            </template>
          </span>
          <span v-if="selling.coefficientOnMaterials" text-xs opacity-60>{{ t('pricing.coefficient', { value: selling.coefficientOnMaterials.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) }) }}</span>
        </p>

        <!-- la formule -->
        <div flex flex-col gap-2 rounded-xl p-3 bg="gray-500/8">
          <span text-xs font-semibold uppercase opacity-60>{{ t('pricing.formula') }}</span>
          <NSelect :value="mode" :options="modeOptions" size="small" @update:value="onModeChange" />
          <p text-xs opacity-60>
            {{ t(`pricing.help.${mode}`) }}
          </p>
          <div flex flex-wrap items-center gap-2>
            <NInputNumber v-model:value="value" :min="0" :max="mode === 'margin' ? 99 : undefined" :step="mode === 'margin' ? 5 : 0.1" size="small" w-9rem @update:value="dirty = true">
              <template #suffix>
                {{ valueSuffix }}
              </template>
            </NInputNumber>
            <span text-sm opacity-70>{{ t('pricing.vat') }}</span>
            <NSelect v-model:value="vatRate" :options="vatOptions" size="small" w-7rem @update:value="dirty = true" />
          </div>
          <div flex flex-wrap justify-end gap-2>
            <NButton v-if="pricing.pricing.isCustom" size="small" quaternary :disabled="saving" @click="savePricing(true)">
              {{ t('pricing.use_recommended') }}
            </NButton>
            <NButton size="small" type="primary" :loading="saving" :disabled="!dirty || value == null" @click="savePricing()">
              {{ t('pricing.save') }}
            </NButton>
          </div>
        </div>
      </section>
    </template>

    <NModal v-model:show="showSettings">
      <ProductionSettingsDialog @close="showSettings = false" />
    </NModal>
  </div>
</template>
