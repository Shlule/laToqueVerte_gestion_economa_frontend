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
const perUnitLabel = computed(() => recipeData.unitType === 'unit'
  ? t('pricing.per_piece')
  : t('pricing.per_unit', { unit: recipeData.unitType }))

/** Parts du coût de revient pour la barre colorée. */
const segments = computed(() => {
  const b = breakdown.value
  if (!b || !Number(b.productionCost))
    return []
  const total = Number(b.productionCost)
  return [
    {
      key: 'materials',
      value: Number(b.materials),
      class: 'bg-teal-500',
    },
    {
      key: 'energy',
      value: Number(b.energy),
      class: 'bg-amber-500',
    },
    {
      key: 'labor',
      value: Number(b.labor),
      class: 'bg-indigo-500',
    },
  ].map(segment => ({ ...segment, percent: segment.value / total * 100 }))
})

// ANCHOR - temps (main d'œuvre et cuisson), modifiables ici
const editingTimes = ref(false)
const laborTime = ref<number | null>(null)
const cookingTime = ref<number | null>(null)
function startEditTimes() {
  laborTime.value = recipeData.laborTime ?? null
  cookingTime.value = recipeData.cookingTime ?? null
  editingTimes.value = true
}
async function saveTimes() {
  await patchRecipe(recipeData.id, { laborTime: laborTime.value || null, cookingTime: cookingTime.value || null })
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
  <div mt-2 flex flex-col gap-4 text-left>
    <NSpin v-if="isLoading" />
    <template v-else-if="breakdown && pricing">
      <!-- coût de revient -->
      <section flex flex-col gap-2>
        <div flex items-baseline justify-between gap-2>
          <h3 font-bold>
            {{ t('pricing.production_cost') }}
          </h3>
          <button icon-btn flex items-center gap-1 text-sm :title="t('pricing.settings')" @click="showSettings = true">
            <span i-carbon-settings-adjust />{{ t('pricing.settings') }}
          </button>
        </div>
        <div flex items-baseline justify-between gap-2>
          <span text-2xl font-mono>{{ formatPrice(breakdown.productionCost) }}</span>
          <span v-if="breakdown.productionCostPerUnit != null" text-sm opacity-80>
            {{ formatPrice(breakdown.productionCostPerUnit) }} {{ perUnitLabel }}
          </span>
        </div>
        <div v-if="segments.length" h-2 flex overflow-hidden rounded-full bg="gray-500/15">
          <div v-for="segment in segments" :key="segment.key" :class="segment.class" :style="{ width: `${segment.percent}%` }" />
        </div>
        <ul flex flex-col gap-1 text-sm>
          <li flex items-center gap-2>
            <span h-2 w-2 shrink-0 rounded-full bg-teal-500 />
            <span flex-1>{{ t('pricing.materials') }}</span>
            <span font-mono>{{ formatPrice(breakdown.materials) }}</span>
          </li>
          <li flex items-center gap-2>
            <span h-2 w-2 shrink-0 rounded-full bg-amber-500 />
            <span flex-1>
              {{ t('pricing.energy') }}
              <span v-if="breakdown.cookingTime" text-xs opacity-60>
                ({{ formatDuration(breakdown.cookingTime) }} × {{ Number(pricing.settings.ovenPower).toLocaleString('fr-FR') }} kW × {{ formatPrice(pricing.settings.electricityPrice, 4) }}/kWh)
              </span>
              <span v-else-if="!Number(breakdown.energy)" text-xs opacity-60>({{ t('pricing.no_cooking') }})</span>
            </span>
            <span font-mono>{{ formatPrice(breakdown.energy) }}</span>
          </li>
          <li flex items-center gap-2>
            <span h-2 w-2 shrink-0 rounded-full bg-indigo-500 />
            <span flex-1>
              {{ t('pricing.labor') }}
              <span v-if="breakdown.laborTime" text-xs opacity-60>
                ({{ formatDuration(breakdown.laborTime) }} × {{ formatPrice(pricing.settings.laborHourlyRate) }}/h)
              </span>
              <span v-else-if="!Number(breakdown.labor)" text-xs opacity-60>({{ t('pricing.no_labor') }})</span>
            </span>
            <span font-mono>{{ formatPrice(breakdown.labor) }}</span>
          </li>
          <li v-if="Number(breakdown.fromSubRecipes)" pl-4 text-xs opacity-60>
            {{ t('pricing.from_sub_recipes', { amount: formatPrice(breakdown.fromSubRecipes) }) }}
          </li>
        </ul>

        <div v-if="!editingTimes">
          <NButton size="tiny" quaternary @click="startEditTimes">
            <div i-carbon-time mr-1 />{{ t('pricing.edit_times') }}
          </NButton>
        </div>
        <div v-else flex flex-wrap items-center gap-2 rounded-lg p-2 text-sm bg="gray-500/8">
          <span>{{ t('pricing.labor') }}</span>
          <NInputNumber v-model:value="laborTime" :min="0" size="small" w-7rem>
            <template #suffix>
              min
            </template>
          </NInputNumber>
          <span>{{ t('pricing.cooking') }}</span>
          <NInputNumber v-model:value="cookingTime" :min="0" size="small" w-7rem>
            <template #suffix>
              min
            </template>
          </NInputNumber>
          <NButton size="small" type="primary" @click="saveTimes">
            {{ t('button.confirm') }}
          </NButton>
          <NButton size="small" quaternary @click="editingTimes = false">
            {{ t('button.cancel') }}
          </NButton>
        </div>
      </section>

      <!-- prix de vente -->
      <section flex flex-col gap-2 border-t="1 gray-500/15" pt-3>
        <div flex items-center justify-between gap-2>
          <h3 font-bold>
            {{ t('pricing.selling_price') }}
          </h3>
          <NTag v-if="isRecommended" size="small" type="success" round>
            {{ t('pricing.recommended_formula') }}
          </NTag>
          <NTag v-else size="small" round>
            {{ t('pricing.custom_formula') }}
          </NTag>
        </div>
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

        <div v-if="selling" grid="~ cols-2" gap-2>
          <div rounded-xl p-2 bg="teal-500/10">
            <div text-xs opacity-70>
              {{ perUnitLabel }} TTC
            </div>
            <div text-xl font-mono>
              {{ formatPrice(selling.perUnitTTC) }}
            </div>
            <div text-xs opacity-60>
              {{ formatPrice(selling.perUnitHT) }} HT
            </div>
          </div>
          <div rounded-xl p-2 bg="teal-500/10">
            <div text-xs opacity-70>
              {{ t('pricing.whole_batch') }} TTC
            </div>
            <div text-xl font-mono>
              {{ formatPrice(selling.priceTTC) }}
            </div>
            <div text-xs opacity-60>
              {{ formatPrice(selling.priceHT) }} HT
            </div>
          </div>
        </div>
        <p v-if="selling" flex flex-wrap gap-x-4 text-sm>
          <span :class="marginClass">{{ t('pricing.margin', { rate: selling.marginRate?.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) ?? '–' }) }}</span>
          <span v-if="selling.coefficientOnMaterials" opacity-70>{{ t('pricing.coefficient', { value: selling.coefficientOnMaterials.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) }) }}</span>
        </p>

        <div flex flex-wrap justify-end gap-2>
          <NButton v-if="pricing.pricing.isCustom" size="small" quaternary :disabled="saving" @click="savePricing(true)">
            {{ t('pricing.use_recommended') }}
          </NButton>
          <NButton size="small" type="primary" :loading="saving" :disabled="!dirty || value == null" @click="savePricing()">
            {{ t('pricing.save') }}
          </NButton>
        </div>
      </section>
    </template>

    <NModal v-model:show="showSettings">
      <ProductionSettingsDialog @close="showSettings = false" />
    </NModal>
  </div>
</template>
