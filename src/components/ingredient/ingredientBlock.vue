<script setup lang="ts">
import { NCard, NCollapseTransition } from 'naive-ui'
import type { Ingredient } from '~/types'

const props = defineProps<{ ingredientData: Ingredient }>()
const ingredientData = useVModel(props, 'ingredientData')
const [showCollapse, toggleShowCollapse] = useToggle()
const { data } = getAllStocks(ingredientData.value.stock?.id)
</script>

<template>
  <div w-full flex flex-col gap-2>
    <NCard :bordered="false" class="transition-all active:scale-102" flex cursor-pointer rounded-2xl rounded-lg shadow-md active:bg-stone-2 hover:bg-stone-1 hover:shadow-2xl>
      <div h-full w-full flex items-center justify-between @click="toggleShowCollapse()">
        <div flex gap-2>
          <div text-3xl>
            {{ ingredientData.name }}
          </div>
          <div self-end>
            de "{{ ingredientData.fournisseur }}"
            {{ data }}
          </div>
        </div>
        <div flex gap-2>
          <div text-3xl>
            {{ ingredientData.pricePerUnit }}
          </div>
          <p text-lg>
            per Unit
          </p>
        </div>
        <NButton circle type="error" text-red>
          <div i-fluent:delete-24-regular />
        </NButton>
      </div>
    </NCard>
    <NCollapseTransition :show="showCollapse">
      <StockBlock />
    </NCollapseTransition>
  </div>
</template>

<style scoped>

</style>
