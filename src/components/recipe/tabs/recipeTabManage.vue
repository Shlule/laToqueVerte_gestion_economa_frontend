<script setup lang="ts">
import type { Recipe, RecipeUsage } from '~/types'
import { useQueryClient } from '@tanstack/vue-query'
import { NAlert, NButton, NCard, NModal, NSpin, useNotification } from 'naive-ui'
import { deleteRecipe, getRecipeUsage } from '~/composables/apiService'

// Onglet « Gérer » : modifier la recette (assistant pré-rempli) ou la supprimer,
// en montrant avant ce que la suppression emporte (recettes qui l'utilisent, lots de stock).

const { recipe } = defineProps<{ recipe: Recipe }>()

const { t } = useI18n()
const notification = useNotification()
const queryClient = useQueryClient()

const [isEditing, toggleEditing] = useToggle()

// ANCHOR - suppression
const confirming = ref(false)
const usage = ref<RecipeUsage | null>(null)
const usageLoading = ref(false)
const deleting = ref(false)

async function askDelete() {
  confirming.value = true
  usage.value = null
  usageLoading.value = true
  try {
    usage.value = await getRecipeUsage(recipe.id) ?? null
  }
  finally {
    usageLoading.value = false
  }
}

async function confirmDelete() {
  deleting.value = true
  try {
    await deleteRecipe(recipe.id)
    confirming.value = false
    // les recettes qui l'utilisaient ont changé de coût
    await Promise.all([
      'allRecipes',
      'subRecipes',
      'recipePricing',
      'insufficientSubRecipes',
    ]
      .map(key => queryClient.invalidateQueries({
        queryKey: [key],
      })))
    notification.success({
      title: t('recipe-manage.deleted', { name: recipe.name }),
      duration: 3000,
    })
  }
  catch (e) {
    notification.error({
      title: t('recipe-manage.delete'),
      content: e instanceof Error
        ? e.message
        : String(e),
      duration: 5000,
    })
  }
  finally {
    deleting.value = false
  }
}
</script>

<template>
  <div flex flex-col gap-4 py-3 text-left>
    <div flex flex-col gap-1>
      <NButton type="primary" secondary @click="toggleEditing(true)">
        <div i-carbon-edit mr-2 />{{ t('recipe-manage.edit') }}
      </NButton>
      <p text-xs opacity-60>
        {{ t('recipe-manage.edit_help') }}
      </p>
    </div>

    <div flex flex-col gap-1 border-t="1 gray-500/15" pt-4>
      <NButton type="error" secondary @click="askDelete">
        <div i-carbon-trash-can mr-2 />{{ t('recipe-manage.delete') }}
      </NButton>
      <p text-xs opacity-60>
        {{ t('recipe-manage.delete_help') }}
      </p>
    </div>

    <NModal v-model:show="isEditing">
      <RecipeCreate v-model:show-create-ingredient="isEditing" :recipe-id="recipe.id" />
    </NModal>

    <NModal v-model:show="confirming">
      <NCard role="dialog" :title="t('recipe-manage.delete_confirm', { name: recipe.name })" max-w-30rem w-92vw :segmented="{ footer: 'soft' }">
        <NSpin v-if="usageLoading" />
        <div v-else flex flex-col gap-3>
          <NAlert v-if="usage?.usedIn.length" type="warning">
            {{ t('recipe-manage.used_in', { names: usage.usedIn.map(parent => parent.name).join(', ') }) }}
          </NAlert>
          <NAlert v-if="usage?.stockLots" type="warning">
            {{ t('recipe-manage.stocks', { active: usage.activeStockLots }, usage.stockLots) }}
          </NAlert>
          <p>{{ t('recipe-manage.delete_warning') }}</p>
        </div>
        <template #footer>
          <div flex justify-end gap-2>
            <NButton @click="confirming = false">
              {{ t('button.cancel') }}
            </NButton>
            <NButton type="error" :loading="deleting" :disabled="usageLoading" @click="confirmDelete">
              {{ t('recipe-manage.delete') }}
            </NButton>
          </div>
        </template>
      </NCard>
    </NModal>
  </div>
</template>
