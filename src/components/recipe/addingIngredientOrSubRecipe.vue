<script setup lang="ts">
import type { PickedComponent } from './componentPicker.vue'
import type { Ingredient, Recipe } from '~/types'
import { useQueryClient } from '@tanstack/vue-query'
import { NButton, NCard, NEmpty, useNotification } from 'naive-ui'
import { createRecipeIngredient, createSubRecipe } from '~/composables/apiService'

// Ajout d'ingrédients ou de préparations à une recette existante :
// recherche → quantité → liste en attente → confirmation (un seul envoi par type).

const emits = defineEmits<{ (event: 'toggleAddingSomethingToRecipe'): void }>()

const recipeId = inject<string>('recipeId') as string
const { t } = useI18n()
const notification = useNotification()
const queryClient = useQueryClient()
const recipeStore = useRecipeStore()

const recipeName = computed(() => recipeStore.getRecipeCachedValue(recipeId)?.name ?? '')

const pending = ref<(PickedComponent & { key: string })[]>([])
const saving = ref(false)
const error = ref('')

function add(component: PickedComponent) {
  pending.value.push({
    ...component,
    key: crypto.randomUUID(),
  })
}
function remove(key: string) {
  pending.value = pending.value.filter(line => line.key !== key)
}
function unitLabel(unit: string) {
  return unit === 'unit'
    ? t('recipe-wizard.unit_piece')
    : unit
}

async function confirm() {
  saving.value = true
  error.value = ''
  try {
    const ingredients = pending.value.filter(line => line.kind === 'ingredient')
    const recipes = pending.value.filter(line => line.kind === 'recipe')
    // le serveur accepte un identifiant à la place de l'objet complet
    if (ingredients.length) {
      await createRecipeIngredient(ingredients.map(line => ({
        recipeId,
        ingredient: { id: line.id } as Ingredient,
        quantityNeeded: line.quantityNeeded,
        unit: line.unit,
      })))
    }
    if (recipes.length) {
      await createSubRecipe(recipes.map(line => ({
        parentRecipeId: recipeId,
        childRecipe: { id: line.id } as Recipe,
        quantityNeeded: line.quantityNeeded,
        unit: line.unit,
      })))
    }
    await Promise.all([
      ['recipeIngredients', recipeId],
      ['subRecipes', recipeId],
      ['insufficientIngredients', recipeId],
      ['insufficientSubRecipes', recipeId],
      ['allRecipes'],
    ].map(queryKey => queryClient.invalidateQueries({ queryKey })))
    notification.success({
      title: t('component-picker.added', { count: pending.value.length }),
      duration: 2500,
    })
    pending.value = []
    emits('toggleAddingSomethingToRecipe')
  }
  catch (e) {
    error.value = e instanceof Error
      ? e.message
      : String(e)
  }
  finally {
    saving.value = false
  }
}

function cancel() {
  emits('toggleAddingSomethingToRecipe')
}
</script>

<template>
  <NCard role="dialog" :title="t('component-picker.title', { name: recipeName })" max-w-48rem w-92vw :segmented="{ content: true, footer: 'soft' }">
    <div flex flex-col gap-4>
      <ComponentPicker :exclude-recipe-ids="[recipeId]" @add="add" />

      <div>
        <h3 mb-2 text-sm opacity-70>
          {{ t('addComponent.title') }}
        </h3>
        <NEmpty v-if="!pending.length" size="small" :description="t('component-picker.nothing_yet')" />
        <ul v-else flex flex-col gap-1>
          <li v-for="line in pending" :key="line.key" flex items-center gap-3 rounded-lg px-3 py-2 bg="gray-500/8">
            <div :class="line.kind === 'ingredient' ? 'i-carbon-wheat' : 'i-carbon-book'" opacity-60 />
            <span flex-1>{{ line.name }}</span>
            <span opacity-80>{{ line.quantityNeeded }} {{ unitLabel(line.unit) }}</span>
            <button icon-btn :title="t('recipe-wizard.remove')" @click="remove(line.key)">
              <div i-fluent:delete-24-regular />
            </button>
          </li>
        </ul>
        <p v-if="error" mt-2 text-sm text-red>
          {{ error }}
        </p>
      </div>
    </div>

    <template #footer>
      <div flex justify-end gap-2>
        <NButton @click="cancel()">
          {{ t('button.cancel') }}
        </NButton>
        <NButton type="primary" :disabled="!pending.length" :loading="saving" @click="confirm()">
          {{ t('button.confirm') }}
        </NButton>
      </div>
    </template>
  </NCard>
</template>
