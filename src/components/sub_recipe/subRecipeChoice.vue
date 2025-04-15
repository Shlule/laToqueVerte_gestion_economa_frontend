<script setup lang="ts">
// TODO - try to create generic component for this one and IngredientChoice.vue

import type { AddSubRecipe, Recipe, Unit } from '~/types'

const RecipeData = defineModel<Recipe>('RecipeData', { required: true })

const { activeSection, setActiveSection } = useSectionManager(['display', 'adding'])
const { t } = useI18n()

const quantityNeeded = ref(0)
const unit = ref<Unit>('kg')
const recipeId = inject<string>('recipeId') as string

const subRecipeStore = useSubRecipeStore()

const subRecipesToAdd = computed<AddSubRecipe>(() => ({
  quantityNeeded: quantityNeeded.value,
  unit: unit.value,
  childRecipe: RecipeData.value,
  parentRecipeId: recipeId,

}))

function resetFormValue() {
  quantityNeeded.value = 0
  unit.value = 'kg'
}

function cancel() {
  setActiveSection('display')
  resetFormValue()
}

function confirm() {
  subRecipeStore.addSubRecipeToList(subRecipesToAdd.value)
  // recipeIngredientStore.addRecipeIngredient.mutate({ recipeIngredient: recipeIngredientToAdd.value, ingredient: ingredientData.value })
  setActiveSection('display')
  resetFormValue()
}
</script>

<template>
  <div>
    <NCard v-if="activeSection === 'display'" :bordered="false" flex cursor-pointer rounded-2xl shadow-lg transition-all hover:scale-102 dark:ncard-dark hover:bg-neutral-1 hover:shadow-2xl>
      <div h-full w-full flex items-center justify-between>
        <div flex gap-2>
          <div text-3xl>
            {{ RecipeData.name }}
          </div>
        </div>
        <div flex gap-2>
          <div text-3xl>
            {{ RecipeData.cost }}{{ t('money-symbol') }}
          </div>
          <p text-lg>
            per {{ RecipeData.unitType }}
          </p>
        </div>
        <div id="button-menu" flex gap-4>
          <NButton circle type="success" text-green @click.stop @click="setActiveSection('adding')">
            <div i-material-symbols:add-shopping-cart-rounded />
          </NButton>
        </div>
      </div>
    </NCard>
    <FadeSlideTransition>
      <div v-if="activeSection === 'adding'" id="stockEdit-container" m-y-3 w-full flex items-center gap-2>
        <div w-full flex>
          <NCard :bordered="false" flex rounded-2xl p-0 shadow-xl>
            <div id="form-input-container" h-full flex justify-evenly gap-2>
              <div flex items-center gap-2 class="flex-basis-2/3">
                <p flex-shrink-0>
                  {{ t('stock-create.form_input.quantity') }}:
                </p>
                <NInputNumber v-model:value="quantityNeeded" />
              </div>
              <div flex items-center gap-2 class="flex-basis-1/3">
                <p flex shrink-0>
                  {{ t('stock-create.form_input.unit') }}:
                </p>
                <NSelect v-model:value="unit" :options="unitOptions" />
              </div>
            </div>
          </NCard>
        </div>
        <div id="button-menu" flex gap-3>
          <NButton circle type="error" text-red @click="cancel()">
            <div i-material-symbols:close-rounded />
          </NButton>
          <NButton circle type="success" text-green @click="confirm()">
            <div i-fluent:checkmark-20-regular />
          </NButton>
        </div>
      </div>
    </FadeSlideTransition>
  </div>
</template>

<style scoped>

</style>
