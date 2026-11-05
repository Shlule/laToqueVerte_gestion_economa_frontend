<script setup lang="ts">
import type { ConsumptionLine, ProduceResponse, Recipe, Unit } from '~/types'
import { useQueryClient } from '@tanstack/vue-query'
import { format } from 'date-fns'
import { NAlert, NButton, NCard, NDatePicker, NInput, NInputNumber, NSelect, NSpin, useNotification } from 'naive-ui'
import { produceRecipe } from '~/composables/apiService'

// « Faire la recette » : ajoute un stock de la préparation.
// Avant de valider, on montre ce que la fabrication retirerait des stocks (lots les plus urgents d'abord)
// et on demande si on retire ces quantités ou non.

const props = defineProps<{ recipe: Recipe }>()
const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const notification = useNotification()
const queryClient = useQueryClient()

const today = format(new Date(), 'yyyy-MM-dd')
const quantity = ref<number | null>(Number(props.recipe.quantity))
const unit = ref<Unit>(props.recipe.unitType)
const lotNumber = ref(`${props.recipe.name.slice(0, 3).toUpperCase()}-${today.replaceAll('-', '')}`)
const creationDate = ref<string | null>(today)
const expirationDate = ref<string | null>(null)

const unitOptions = computed(() => (props.recipe.unitType === 'unit'
  ? ['unit']
  : ['kg', 'g'])
  .map(value => ({
    value,
    label: value === 'unit'
      ? t('recipe-wizard.unit_piece')
      : value,
  })))

function unitLabel(value: Unit, count = 1) {
  if (value !== 'unit')
    return value
  return count > 1
    ? t('produce.pieces')
    : t('recipe-wizard.unit_piece')
}
function qty(value: number) {
  return Number(value).toLocaleString('fr-FR', { maximumFractionDigits: 3 })
}

// ANCHOR - aperçu de ce qui sera retiré des stocks
const preview = ref<ProduceResponse | null>(null)
const previewLoading = ref(false)
const error = ref('')

const refreshPreview = useDebounceFn(async () => {
  if (!quantity.value || quantity.value <= 0) {
    preview.value = null
    return
  }
  previewLoading.value = true
  try {
    preview.value = await produceRecipe(props.recipe.id, {
      quantity: quantity.value,
      unit: unit.value,
      consumeStock: true,
      dryRun: true,
    }) ?? null
    error.value = ''
  }
  catch (e) {
    error.value = e instanceof Error
      ? e.message
      : String(e)
  }
  finally {
    previewLoading.value = false
  }
}, 250)
watch([quantity, unit], refreshPreview, { immediate: true })

const lines = computed<(ConsumptionLine & { kind: 'ingredient' | 'recipe' })[]>(() => preview.value
  ? [
      ...preview.value.consumption.ingredients.map(line => ({ ...line, kind: 'ingredient' as const })),
      ...preview.value.consumption.subRecipes.map(line => ({ ...line, kind: 'recipe' as const })),
    ]
  : [])
const shortages = computed(() => lines.value.filter(line => Number(line.missing) > 0))

// ANCHOR - validation
const saving = ref<'consume' | 'keep' | null>(null)

async function produce(consumeStock: boolean) {
  if (!quantity.value)
    return
  saving.value = consumeStock
    ? 'consume'
    : 'keep'
  try {
    await produceRecipe(props.recipe.id, {
      quantity: quantity.value,
      unit: unit.value,
      lotNumber: lotNumber.value.trim(),
      creationDate: creationDate.value ?? today,
      expirationDate: expirationDate.value,
      consumeStock,
    })
    // les stocks ont bougé : listes de stocks et manques de toutes les recettes
    await Promise.all([
      'craftedStocks',
      'stocks',
      'insufficientIngredients',
      'insufficientSubRecipes',
    ]
      .map(key => queryClient.invalidateQueries({
        queryKey: [key],
      })))
    notification.success({
      title: t('produce.done', {
        quantity: qty(quantity.value),
        unit: unitLabel(unit.value),
        name: props.recipe.name,
      }),
      content: consumeStock
        ? t('produce.done_consumed')
        : t('produce.done_kept'),
      duration: 3500,
    })
    emit('close')
  }
  catch (e) {
    error.value = e instanceof Error
      ? e.message
      : String(e)
  }
  finally {
    saving.value = null
  }
}
</script>

<template>
  <NCard role="dialog" :title="t('produce.title', { name: recipe.name })" max-w-44rem w-92vw :segmented="{ content: true, footer: 'soft' }">
    <template #header-extra>
      <button icon-btn :title="t('button.cancel')" @click="emit('close')">
        <div i-material-symbols:close-rounded />
      </button>
    </template>

    <div flex flex-col gap-4>
      <!-- ce qu'on fabrique -->
      <div grid gap-3 sm:grid-cols-2>
        <label flex flex-col gap-1>
          <span text-sm opacity-70>{{ t('produce.quantity') }}</span>
          <div flex gap-2>
            <NInputNumber v-model:value="quantity" :min="0.001" flex-1 />
            <NSelect v-model:value="unit" :options="unitOptions" w-7rem />
          </div>
          <span v-if="preview" text-xs opacity-60>
            {{ t('produce.batches', { count: qty(preview.consumption.factor) }) }}
          </span>
        </label>
        <label flex flex-col gap-1>
          <span text-sm opacity-70>{{ t('stock-create.form_input.lot_number') }}</span>
          <NInput v-model:value="lotNumber" :placeholder="t('stock-create.form_input.lot_placeholder')" />
        </label>
        <label flex flex-col gap-1>
          <span text-sm opacity-70>{{ t('produce.made_on') }}</span>
          <NDatePicker v-model:formatted-value="creationDate" value-format="yyyy-MM-dd" format="dd/MM/yyyy" type="date" :placeholder="t('produce.pick_date')" />
        </label>
        <label flex flex-col gap-1>
          <span text-sm opacity-70>{{ t('produce.best_before') }}</span>
          <NDatePicker v-model:formatted-value="expirationDate" value-format="yyyy-MM-dd" format="dd/MM/yyyy" type="date" clearable :placeholder="t('produce.optional')" />
        </label>
      </div>

      <!-- ce qui sera retiré des stocks -->
      <div>
        <h3 mb-2 flex items-center gap-2 font-bold>
          {{ t('produce.uses') }}
          <NSpin v-if="previewLoading" size="small" />
        </h3>
        <table v-if="lines.length" w-full text-left text-sm>
          <thead opacity-60>
            <tr>
              <th font-normal>
                {{ t('recipe-wizard.component') }}
              </th>
              <th text-right font-normal>
                {{ t('produce.needed') }}
              </th>
              <th text-right font-normal>
                {{ t('produce.in_stock') }}
              </th>
              <th pl-3 font-normal>
                {{ t('produce.lots') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="line in lines" :key="line.ingredientId ?? line.childRecipeId" border-t="1 gray-500/15">
              <td py-1.5>
                {{ line.name }}
                <span v-if="line.kind === 'recipe'" text-xs opacity-60>({{ t('recipe-wizard.kind_recipe') }})</span>
              </td>
              <td text-right font-mono>
                {{ qty(line.needed) }} {{ unitLabel(line.unit, Number(line.needed)) }}
              </td>
              <td text-right font-mono :class="Number(line.missing) > 0 ? 'text-red-600 dark:text-red-300' : 'text-teal-700 dark:text-teal-300'">
                <template v-if="Number(line.missing) > 0">
                  {{ t('produce.missing', { quantity: qty(line.missing) }) }}
                </template>
                <span v-else i-carbon-checkmark inline-block />
              </td>
              <td pl-3 text-xs opacity-70>
                <span v-for="lot in line.lots" :key="lot.stockId" mr-2 inline-block>
                  {{ lot.lotNumber || t('produce.no_lot') }} : −{{ qty(lot.taken) }}<template v-if="lot.emptied"> ({{ t('produce.emptied') }})</template>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else-if="!previewLoading" text-sm opacity-60>
          {{ t('produce.nothing_used') }}
        </p>
      </div>

      <NAlert v-if="shortages.length" type="warning" :title="t('produce.shortage_title')">
        {{ t('produce.shortage_text') }}
      </NAlert>
      <NAlert v-if="error" type="error">
        {{ error }}
      </NAlert>
    </div>

    <template #footer>
      <p mb-3 text-sm font-bold>
        {{ t('produce.question') }}
      </p>
      <div flex flex-wrap items-center justify-end gap-2>
        <NButton quaternary mr-auto @click="emit('close')">
          {{ t('button.cancel') }}
        </NButton>
        <NButton :loading="saving === 'keep'" :disabled="!quantity || !!saving" @click="produce(false)">
          {{ t('produce.keep_stock') }}
        </NButton>
        <NButton type="primary" :loading="saving === 'consume'" :disabled="!quantity || !!saving || !preview" @click="produce(true)">
          {{ t('produce.consume_stock') }}
        </NButton>
      </div>
    </template>
  </NCard>
</template>
