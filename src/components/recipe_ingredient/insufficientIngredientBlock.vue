<script setup lang="ts">
import type { InsufficientIngredient } from '~/types'

const insufficientIngredientData = defineModel<InsufficientIngredient>('insufficientIngredientData', { required: true })
const { t } = useI18n()
</script>

<template>
  <div id="insufficientIngredient-card-container" m-y-3 w-full flex gap-2>
    <NCard :bordered="false" flex rounded-2xl shadow-xl size="small">
      <div h-full flex justify-between>
        <div align-center text-6>
          {{ insufficientIngredientData.name }}
        </div>
        <div id="expiration-date-block" flex self-center text-5>
          <div m-r-4 self-end text-4>
            {{ t('recipeIngredient-block.quantity_needed') }}:
          </div>
          {{ insufficientIngredientData.missingQuantity }} {{ insufficientIngredientData.unit }}
        </div>
      </div>
    </NCard>
  </div>
</template>

<style scoped>

</style>
