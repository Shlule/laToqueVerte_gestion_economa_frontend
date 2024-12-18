<script setup lang="ts">
import { NInput, NInputNumber, NSelect } from 'naive-ui'

const props = defineProps<{ showCreateIngredient: boolean }>()
const showCreateIngredient = useVModel(props, 'showCreateIngredient')

function toggleShowCreateIngredient() {
  showCreateIngredient.value = !showCreateIngredient.value
}

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
  <NCard role="form-dialog" title="Create New Ingredient" w-36rem flex>
    <div id="forms-input" flex flex-col gap-2>
      <NInput v-model:value="createIngredientStore.newIngredientName" type="text" placeholder="Nom de l'Ingredient" text-center text-6 />
      <div flex gap-2>
        <div class="flex-basis-2/3" flex items-center gap-2>
          <p flex-shrink-0>
            prix par unite
          </p>
          <NInputNumber v-model:value="createIngredientStore.newIngredientPrice" />
        </div>
        <div flex items-center gap-2 class="flex flex-basis-1/3">
          <p flex shrink-0>
            unite
          </p>
          <NSelect v-model:value="createIngredientStore.newIngredientUnit" :options="unitOptions" />
        </div>
      </div>
      <NInput v-model:value="createIngredientStore.newIngredientFournisseur" type="text" placeholder="Nom du Fournisseur" text-center text-4 />
    </div>
    <div id="buttons" m-t-4 flex justify-end gap-2>
      <NButton type="success" text-green @click="createIngredientStore.createIngredient">
        Confirm
      </NButton>
      <NButton @click="toggleShowCreateIngredient()">
        Cancel
      </NButton>
    </div>
  </NCard>
</template>

<style scoped>

</style>
