<script setup lang="ts">
import type { Ingredient } from '~/types'

const { t } = useI18n()

const ingredientData = defineModel<Ingredient>('ingredientData', { required: true })
</script>

<template>
  <NCard :bordered="false" flex cursor-pointer rounded-2xl shadow-lg transition-all hover:scale-102 dark:ncard-dark hover:bg-neutral-1 hover:shadow-2xl>
    <div h-full w-full flex items-center justify-between>
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
          {{ ingredientData.pricePerUnit }}{{ t('money-symbol') }}
        </div>
        <p text-lg>
          per {{ ingredientData.unitType }}
        </p>
      </div>
      <div id="button-menu" flex gap-4>
        <slot />
      </div>
    </div>
  </NCard>
</template>

<style scoped>

</style>
