<script setup lang="ts">
import type { Recipe } from '~/types'
import { useQuery } from '@tanstack/vue-query'
import { NButton, NCard, NModal } from 'naive-ui'
import { getRecipePricing } from '~/composables/apiService'
import { formatPrice } from '~/composables/money'

// Onglet « économat » : l'essentiel en quatre chiffres (coût et prix de vente, total et à l'unité).
// Le bouton « Plus de détails » ouvre le calcul complet et le choix de la formule de prix.

const { recipeData } = defineProps<{ recipeData: Recipe }>()
const { t } = useI18n()

const { data: pricing } = useQuery({
  queryKey: [
    'recipePricing',
    recipeData.id,
    () => recipeData.cost,
  ],
  queryFn: () => getRecipePricing(recipeData.id),
})

/** Unité affichée : la part si on l'a renseignée, sinon la pièce ou le kg. */
const unit = computed(() => {
  const quantity = Number(recipeData.quantity)
  if (recipeData.portions) {
    return {
      label: t('pricing.unit_portion'),
      divisor: recipeData.portions,
    }
  }
  if (recipeData.unitType === 'unit') {
    return {
      label: t('pricing.unit_piece'),
      divisor: quantity,
    }
  }
  return {
    label: 'kg',
    divisor: recipeData.unitType === 'kg'
      ? quantity
      : quantity / 1000,
  }
})

const tiles = computed(() => {
  const data = pricing.value
  // en attendant le calcul complet, on affiche le coût des matières déjà connu
  const cost = Number(data?.breakdown.productionCost ?? recipeData.cost)
  const price = data
    ? Number(data.pricing.priceTTC)
    : null
  const per = (amount: number | null) => amount == null || !unit.value.divisor
    ? '…'
    : formatPrice(amount / unit.value.divisor)
  return [
    {
      key: 'cost',
      label: t('recipe-tabInfo.title.cost'),
      value: formatPrice(cost),
      image: 'marble3',
    },
    {
      key: 'cost_unit',
      label: t('recipe-tabInfo.title.cost_per', { unit: unit.value.label }),
      value: per(cost),
      image: 'marble3',
    },
    {
      key: 'selling',
      label: t('recipe-tabInfo.title.selling'),
      value: price == null
        ? '…'
        : formatPrice(price),
      image: 'marble',
    },
    {
      key: 'selling_unit',
      label: t('recipe-tabInfo.title.selling_per', { unit: unit.value.label }),
      value: per(price),
      image: 'marble',
    },
  ]
})

const showDetail = ref(false)
</script>

<template>
  <div mt-6 flex flex-col gap-3>
    <div grid="~ cols-2" gap-3>
      <div
        v-for="tile in tiles" :key="tile.key" flex flex-col rounded-2xl bg-center py-1 dark:bg-blend-overlay
        :class="tile.image === 'marble3'
          ? 'bg-[url(~/media/images/marble-texture3.jpg)] dark:bg-[url(~/media/images/dark-earth-texture.jpg)]'
          : 'bg-[url(~/media/images/marble-texture.jpg)] dark:bg-[url(~/media/images/dark-earth-texture.jpg)]'"
      >
        <p px-4 text-left text-sm opacity-80>
          {{ tile.label }}
        </p>
        <p text-6>
          {{ tile.value }}
        </p>
      </div>
    </div>
    <p v-if="pricing" text-xs opacity-60>
      {{ pricing.pricing.isCustom ? t('pricing.custom_formula') : t('pricing.recommended_formula') }} · {{ t(`pricing.mode.${pricing.pricing.mode}`) }}
    </p>
    <div>
      <NButton round secondary @click="showDetail = true">
        <div i-carbon-calculator mr-2 />{{ t('pricing.more_details') }}
      </NButton>
    </div>

    <NModal v-model:show="showDetail">
      <NCard role="dialog" :title="t('pricing.detail_title', { name: recipeData.name })" max-w-40rem w-94vw :segmented="{ content: true }">
        <template #header-extra>
          <button icon-btn :title="t('button.cancel')" @click="showDetail = false">
            <div i-material-symbols:close-rounded />
          </button>
        </template>
        <RecipePricingDetail :recipe-data="recipeData" />
      </NCard>
    </NModal>
  </div>
</template>
