<script setup lang="ts">
import { NSlider } from 'naive-ui'
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
  <div m-t-6 flex gap-2>
    <div class="flex-basis-2/3" flex flex-col items-center justify-center gap-4>
      <div w-full flex flex-col rounded-2xl class="bg-[url(~/media/images/marble-texture3.jpg)] bg-center dark:bg-[url(~/media/images/dark-earth-texture.jpg)]">
        <p text-align-start indent-4 text-4>
          {{ t('recipe-tabInfo.title.cost') }}
        </p>
        <p text-6>
          {{ recipeData.cost }}
        </p>
      </div>
      <div class="bg-[url(~/media/images/marble-texture3.jpg)] bg-right dark:bg-[url(~/media/images/dark-earth-texture.jpg)]" bg-overlay dark:g-dark-1 w-full flex flex-col rounded-2xl dark:bg-blend-overlay>
        <p text-align-start indent-4 text-4>
          {{ t('recipe-tabInfo.title.cost_per_unit') }}
        </p>
        <p text-6>
          {{ pricePerPiece }}
        </p>
      </div>
      <div class="bg-[url(~/media/images/marble-texture.jpg)] bg-right dark:bg-[url(~/media/images/dark-earth-texture.jpg)]" bg-overlay w-full flex flex-col rounded-2xl dark:bg-dark-3 dark:bg-blend-overlay>
        <p text-align-start indent-4 text-4>
          {{ t('recipe-tabInfo.title.selling') }}
        </p>
        <p text-6>
          {{ sellingPrice }}
        </p>
      </div>
      <div class="bg-[url(~/media/images/marble-texture.jpg)] bg-top dark:bg-[url(~/media/images/dark-earth-texture.jpg)]" bg-overlay w-full flex flex-col rounded-2xl dark:bg-dark-5 dark:bg-blend-overlay>
        <p text-align-start indent-4 text-4>
          {{ t('recipe-tabInfo.title.selling_per_unit') }}
        </p>
        <p text-6>
          {{ sellingPricePerPiece }}
        </p>
      </div>
    </div>

    <NCard id="slider-container" class="flex-basis-1/3" rounded-2xl shadow-xl>
      <NSlider
        vertical :max="10" :theme-overrides="{
          // railColor: '#ff6b6b', /* Couleur de la barre */
          fillColor: '#1e90ff', /* Couleur de la barre active */
          fillColorHover: '#1e90ff',
          // handleColor: '#1e90ff', /* Couleur de la poignée */
          // handleBoxShadow: '0 0 5px 2px #1e90ff', /* Ombre */
        }"
      />
    </NCard>
  </div>
</template>

<style scoped>

</style>
