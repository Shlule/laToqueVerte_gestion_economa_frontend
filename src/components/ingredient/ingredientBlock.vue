<script setup lang="ts">
import { NCard } from 'naive-ui'
import type { Ingredient } from '~/types'

const props = defineProps<{ ingredientData: Ingredient }>()
const ingredientData = useVModel(props, 'ingredientData')
</script>

<template>
  <div w-full flex gap-2>
    <NCard :bordered="false" flex cursor-pointer rounded-2xl rounded-lg shadow-md>
      <div h-full w-full flex items-center justify-between>
        <div text-3xl>
          {{ ingredientData.name }}
        </div>
        <div flex gap-2>
          <div text-3xl>
            {{ ingredientData.pricePerKg }}
          </div>
          <p text-lg>
            per Kg
          </p>
        </div>
        <NButton circle>
          <div i-fluent:edit-24-regular />
        </NButton>
      </div>
    </NCard>
  </div>
</template>

<style scoped>

</style>
