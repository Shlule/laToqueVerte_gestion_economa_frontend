<script setup lang="ts">
import type { AddToRecipe, Ingredient, Unit } from '~/types'

const ingredientData = defineModel<Ingredient>('ingredientData', { required: true })

const { activeSection, setActiveSection } = useSectionManager(['display', 'adding'])
const { t } = useI18n()

const quantityNeeded = ref(0)
const unit = ref<Unit>('kg')
const recipeId = inject('recipeId')

const { addRecipeIngredient } = useRecipeIngredientStore()

const recipeIngredientToAdd = computed<AddToRecipe>(() => ({
  quantityNeeded: quantityNeeded.value,
  unit: unit.value,
  ingredientId: ingredientData.value.id,
  recipeId,
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
  addRecipeIngredient.mutate(recipeIngredientToAdd.value)
  setActiveSection('display')
  resetFormValue()
}
</script>

<template>
  <div>
    <IngredientDisplay v-if="activeSection === 'display'" :ingredient-data="ingredientData">
      <NButton circle type="success" text-green @click.stop @click="setActiveSection('adding')">
        <div i-material-symbols:add-shopping-cart-rounded />
      </NButton>
    </IngredientDisplay>
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
