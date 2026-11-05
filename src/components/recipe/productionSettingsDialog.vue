<script setup lang="ts">
import type { PricingMode, ProductionSettings } from '~/types'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { NButton, NCard, NInputNumber, NSelect, NSpin, useNotification } from 'naive-ui'
import { getProductionSettings, updateProductionSettings } from '~/composables/apiService'
import { DEFAULT_VALUES, PRICING_MODES, VAT_RATES } from '~/composables/pricing'

// Réglages communs à toutes les recettes : four, électricité, main d'œuvre,
// TVA et formule de prix conseillée (utilisée tant qu'une recette n'a pas la sienne).

const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const notification = useNotification()
const queryClient = useQueryClient()

const form = ref<ProductionSettings | null>(null)
const { isLoading } = useQuery({
  queryKey: ['productionSettings'],
  queryFn: async () => {
    const data = await getProductionSettings()
    if (data) {
      form.value = {
        ...data,
        ovenPower: Number(data.ovenPower),
        electricityPrice: Number(data.electricityPrice),
        laborHourlyRate: Number(data.laborHourlyRate),
        vatRate: Number(data.vatRate),
        pricingValue: Number(data.pricingValue),
      }
    }
    return data
  },
})

const modeOptions = computed(() => PRICING_MODES.map(key => ({
  value: key,
  label: t(`pricing.mode.${key}`),
})))
const vatOptions = VAT_RATES.map(rate => ({ value: rate, label: `${rate.toLocaleString('fr-FR')} %` }))

function onModeChange(mode: PricingMode) {
  if (!form.value)
    return
  form.value.pricingMode = mode
  form.value.pricingValue = DEFAULT_VALUES[mode]
}

const saving = ref(false)
async function save() {
  if (!form.value)
    return
  saving.value = true
  try {
    await updateProductionSettings(form.value)
    await Promise.all([
      ['productionSettings'],
      ['recipePricing'],
    ].map(queryKey => queryClient.invalidateQueries({ queryKey })))
    notification.success({
      title: t('pricing.settings_saved'),
      duration: 2000,
    })
    emit('close')
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
</script>

<template>
  <NCard role="dialog" :title="t('pricing.settings_title')" max-w-32rem w-92vw :segmented="{ content: true, footer: 'soft' }">
    <NSpin v-if="isLoading || !form" />
    <div v-else flex flex-col gap-4>
      <section flex flex-col gap-2>
        <h3 font-bold>
          {{ t('pricing.energy') }}
        </h3>
        <label flex items-center justify-between gap-3>
          <span>{{ t('pricing.oven_power') }}</span>
          <NInputNumber v-model:value="form.ovenPower" :min="0" :step="0.5" w-12rem>
            <template #suffix>
              kW
            </template>
          </NInputNumber>
        </label>
        <label flex items-center justify-between gap-3>
          <span>{{ t('pricing.electricity_price') }}</span>
          <NInputNumber v-model:value="form.electricityPrice" :min="0" :step="0.01" w-12rem>
            <template #suffix>
              €/kWh
            </template>
          </NInputNumber>
        </label>
        <p text-xs opacity-60>
          {{ t('pricing.energy_help') }}
        </p>
      </section>

      <section flex flex-col gap-2>
        <h3 font-bold>
          {{ t('pricing.labor') }}
        </h3>
        <label flex items-center justify-between gap-3>
          <span>{{ t('pricing.hourly_rate') }}</span>
          <NInputNumber v-model:value="form.laborHourlyRate" :min="0" :step="0.5" w-12rem>
            <template #suffix>
              €/h
            </template>
          </NInputNumber>
        </label>
        <p text-xs opacity-60>
          {{ t('pricing.labor_help') }}
        </p>
      </section>

      <section flex flex-col gap-2>
        <h3 font-bold>
          {{ t('pricing.recommended_formula') }}
        </h3>
        <NSelect :value="form.pricingMode" :options="modeOptions" @update:value="onModeChange" />
        <p text-xs opacity-60>
          {{ t(`pricing.help.${form.pricingMode}`) }}
        </p>
        <div flex items-center gap-3>
          <NInputNumber v-model:value="form.pricingValue" :min="0" :step="0.1" w-10rem />
          <span>{{ t('pricing.vat') }}</span>
          <NSelect v-model:value="form.vatRate" :options="vatOptions" w-8rem />
        </div>
      </section>
    </div>

    <template #footer>
      <div flex justify-end gap-2>
        <NButton @click="emit('close')">
          {{ t('button.cancel') }}
        </NButton>
        <NButton type="primary" :loading="saving" :disabled="!form" @click="save">
          {{ t('button.confirm') }}
        </NButton>
      </div>
    </template>
  </NCard>
</template>
