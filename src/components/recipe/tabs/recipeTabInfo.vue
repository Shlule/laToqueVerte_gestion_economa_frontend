<script setup lang="ts">
import { NDivider } from 'naive-ui'
import type { Recipe } from '~/types'

const { recipeData } = defineProps<{ recipeData: Recipe }>()
const { t } = useI18n()

const pricePerPiece = computed(() => {
  return (recipeData.cost / recipeData.numberOfPieces).toFixed(2)
})

// TODO - Permit to change the equation to compute the selling price
const sellingPrice = computed(() => {
  return (recipeData.cost * 4.5).toFixed(2)
})
const sellingPricePerPiece = computed(() => {
  return (Number(pricePerPiece.value) * 4.5).toFixed(2)
})
</script>

<template>
  <div flex flex-col gap-2>
    <NDivider title-placement="left">
      {{ t('recipe-tabInfo.title.cost') }}
    </NDivider>
    <div flex items-center justify-center gap-4>
      <div flex gap-2>
        <p i-icon-park-twotone:cake-three self-end>
          {{ t('recipe-tabInfo.cost') }}
        </p>
        <p text-2xl>
          {{ recipeData.cost }}
        </p>
      </div>
      <div flex gap-2>
        <p i-icon-park-twotone:cake-one self-end />
        <p text-2xl>
          {{ pricePerPiece }}
        </p>
      </div>
    </div>
    <NDivider title-placement="left">
      {{ t('recipe-tabInfo.title.selling') }}
    </NDivider>
    <div flex items-center justify-center gap-4>
      <div flex gap-2>
        <p i-icon-park-twotone:cake-three self-end>
          {{ t('recipe-tabInfo.cost') }}
        </p>
        <p text-2xl>
          {{ sellingPrice }}
        </p>
      </div>
      <div flex gap-2>
        <p i-icon-park-twotone:cake-one self-end />
        <p text-2xl>
          {{ sellingPricePerPiece }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
