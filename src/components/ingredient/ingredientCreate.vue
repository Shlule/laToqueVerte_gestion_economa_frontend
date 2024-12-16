<script setup lang="ts">
import { NInput, NInputNumber, NSelect } from 'naive-ui'

const createIngredientStore = useCreateIngredientStore()

const unitOptions = [{
  label: 'kg',
  value: 'kg',
}, {
  label: 'g',
  value: 'g',
}, {
  label: 'unit',
  value: 'unit',
}]
</script>

<template>
  <NCard role="form-dialog" title="Create New Ingredient" w-36rem flex flex-col>
    <div id="forms-input" flex flex-col gap-2>
      <NInput v-model:value="createIngredientStore.newIngredientName" type="text" placeholder="Nom de l'Ingredient" text-center text-6 />
      <div flex gap-2>
        <NInputNumber v-model:value="createIngredientStore.newIngredientPrice" />
        <NSelect v-model:value="createIngredientStore.newIngredientUnit" :options="unitOptions" />
        <NInput v-model:value="createIngredientStore.newIngredientFournisseur" type="text" placeholder="Nom du Fournisseur" text-center text-4 />
      </div>
    </div>
    <div id="buttons" m-t-4 flex justify-end gap-2>
      <NButton type="success" text-green>
        Confirm
      </NButton>
      <NButton>
        Cancel
      </NButton>
    </div>
  </NCard>
</template>

<style scoped>

</style>
