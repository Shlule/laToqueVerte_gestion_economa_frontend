<script setup lang="ts">
import { NInput, NInputNumber, NSelect, useNotification } from 'naive-ui'
import { unitOptions } from '~/composables/unit'

const showCreateIngredient = defineModel<boolean>('showCreateIngredient', { required: true })
function toggleShowCreateIngredient() {
  showCreateIngredient.value = !showCreateIngredient.value
}

const ingredientStore = useIngredientStore()
const notification = useNotification()

function createIngredient() {
  ingredientStore.addNewIngredient()
  toggleShowCreateIngredient()
  notification.create({
    title: 'Reussite',
    content: ' la creation de l\'ingredient est un succes',
    type: 'success',
    duration: 2500,
  })
}
</script>

<template>
  <NCard role="form-dialog" title="Create New Ingredient" w-36rem flex>
    <div id="forms-input" flex flex-col gap-2>
      <NInput v-model:value="ingredientStore.newIngredientName" type="text" placeholder="Nom de l'Ingredient" text-center text-6 />
      <div flex gap-2>
        <div class="flex-basis-2/3" flex items-center gap-2>
          <p flex-shrink-0>
            prix par unite
          </p>
          <NInputNumber v-model:value="ingredientStore.newIngredientPrice" />
        </div>
        <div flex items-center gap-2 class="flex flex-basis-1/3">
          <p flex shrink-0>
            unite
          </p>
          <NSelect v-model:value="ingredientStore.newIngredientUnit" :options="unitOptions" />
        </div>
      </div>
      <NInput v-model:value="ingredientStore.newIngredientFournisseur" type="text" placeholder="Nom du Fournisseur" text-center text-4 />
    </div>
    <div id="buttons" m-t-4 flex justify-end gap-2>
      <NButton type="success" text-green @click="createIngredient">
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
