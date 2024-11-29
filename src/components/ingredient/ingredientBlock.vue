<script setup lang="ts">
import { NCard } from 'naive-ui'
import type { Ingredient } from '~/types'

// type ButtonThemeOverrides = NonNullable<ButtonProps['themeOverrides']>

const props = defineProps<{ ingredientData: Ingredient }>()
const ingredientData = useVModel(props, 'ingredientData')
// const buttonThemeOverrides: ButtonThemeOverrides = {
//   textColorHover: '#9e1006',
//   borderHover: '#9e1006',
//   : '#9e1006',
// }
</script>

<template>
  <div w-full flex gap-2>
    <NCard :bordered="false" flex cursor-pointer rounded-2xl rounded-lg shadow-md>
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
  </div>
</template>

<style scoped>

</style>
