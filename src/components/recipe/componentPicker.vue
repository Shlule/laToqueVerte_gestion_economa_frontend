<script setup lang="ts">
import type { Unit } from '~/types'
import { NButton, NInput, NInputNumber, NRadioButton, NRadioGroup, NSelect } from 'naive-ui'
import { formatPrice } from '~/composables/money'
import { searchItems } from '~/composables/search'

// Choix d'un composant de recette (ingrédient ou autre recette) par recherche :
// pensé pour des listes longues, on n'affiche que les meilleurs résultats.
// Clavier : ↑ ↓ pour se déplacer, Entrée pour choisir, puis Entrée dans la quantité pour ajouter.

export interface PickedComponent {
  kind: 'ingredient' | 'recipe'
  id: string
  name: string
  quantityNeeded: number
  unit: Unit
}

const props = withDefaults(defineProps<{
  /** recettes à ne pas proposer (ex. la recette en cours, pour éviter une boucle) */
  excludeRecipeIds?: string[]
}>(), {
  excludeRecipeIds: () => [],
})

const emit = defineEmits<{ add: [component: PickedComponent] }>()

const MAX_RESULTS = 30

const { t } = useI18n()
const ingredientStore = useIngredientStore()
const recipeStore = useRecipeStore()

interface Candidate {
  id: string
  name: string
  detail: string
  unit: Unit
}

const kind = ref<'ingredient' | 'recipe'>('ingredient')
const query = ref('')
const highlighted = ref(0)
const picked = ref<Candidate | null>(null)
const quantity = ref<number | null>(null)
const unit = ref<Unit | null>(null)

const searchInput = ref<InstanceType<typeof NInput> | null>(null)
const quantityInput = ref<InstanceType<typeof NInputNumber> | null>(null)

function unitLabel(value: Unit) {
  return value === 'unit'
    ? t('recipe-wizard.unit_piece')
    : value
}

const ingredients = computed<Candidate[]>(() => (ingredientStore.allIngredient ?? []).map(ingredient => ({
  id: ingredient.id,
  name: ingredient.name,
  detail: [
    `${formatPrice(ingredient.pricePerUnit, 4)} / ${unitLabel(ingredient.unitType)}`,
    ingredient.fournisseur,
  ].filter(Boolean).join(' · '),
  unit: ingredient.unitType,
})))

const recipes = computed<Candidate[]>(() => (recipeStore.recipeList ?? [])
  .filter(recipe => !props.excludeRecipeIds.includes(recipe.id))
  .map(recipe => ({
    id: recipe.id,
    name: recipe.name,
    detail: `${formatPrice(recipe.cost)} ${t('component-picker.for')} ${Number(recipe.quantity)} ${unitLabel(recipe.unitType)}`,
    unit: recipe.unitType,
  })))

const source = computed(() => kind.value === 'ingredient'
  ? ingredients.value
  : recipes.value)
const matches = computed(() => searchItems(source.value, query.value, c => c.name))
const results = computed(() => matches.value.slice(0, MAX_RESULTS))
const hiddenCount = computed(() => matches.value.length - results.value.length)

watch([kind, query], () => {
  highlighted.value = 0
})
watch(kind, () => {
  picked.value = null
  query.value = ''
  nextTick(() => searchInput.value?.focus())
})

const unitOptions = computed(() => picked.value
  ? (picked.value.unit === 'unit'
      ? ['unit'] as Unit[]
      : ['kg', 'g'] as Unit[]).map(value => ({
      value,
      label: unitLabel(value),
    }))
  : [])

function pick(candidate: Candidate | undefined) {
  if (!candidate)
    return
  picked.value = candidate
  // en pâtisserie on pèse en grammes : g par défaut pour ce qui est acheté au kg
  unit.value = candidate.unit === 'kg'
    ? 'g'
    : candidate.unit
  quantity.value = null
  nextTick(() => quantityInput.value?.focus())
}

function onSearchKey(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    highlighted.value = Math.min(highlighted.value + 1, results.value.length - 1)
    document.getElementById(`picker-option-${highlighted.value}`)?.scrollIntoView({ block: 'nearest' })
  }
  else if (event.key === 'ArrowUp') {
    event.preventDefault()
    highlighted.value = Math.max(highlighted.value - 1, 0)
    document.getElementById(`picker-option-${highlighted.value}`)?.scrollIntoView({ block: 'nearest' })
  }
  else if (event.key === 'Enter') {
    event.preventDefault()
    pick(results.value[highlighted.value])
  }
}

const canAdd = computed(() => !!picked.value && !!unit.value && (quantity.value ?? 0) > 0)

function add() {
  if (!canAdd.value || !picked.value)
    return
  emit('add', {
    kind: kind.value,
    id: picked.value.id,
    name: picked.value.name,
    quantityNeeded: quantity.value!,
    unit: unit.value!,
  })
  picked.value = null
  quantity.value = null
  query.value = ''
  nextTick(() => searchInput.value?.focus())
}
</script>

<template>
  <div flex flex-col gap-3>
    <div flex flex-wrap items-center gap-2>
      <NRadioGroup v-model:value="kind">
        <NRadioButton value="ingredient">
          {{ t('recipe-wizard.kind_ingredient') }} <span opacity-60>({{ ingredients.length }})</span>
        </NRadioButton>
        <NRadioButton value="recipe">
          {{ t('recipe-wizard.kind_recipe') }} <span opacity-60>({{ recipes.length }})</span>
        </NRadioButton>
      </NRadioGroup>
      <NInput
        ref="searchInput" v-model:value="query" clearable min-w-14rem flex-1
        :placeholder="kind === 'ingredient' ? t('component-picker.search_ingredient') : t('component-picker.search_recipe')"
        @keydown="onSearchKey"
      >
        <template #prefix>
          <div i-fluent:search-20-filled />
        </template>
      </NInput>
    </div>

    <!-- résultats -->
    <ul role="listbox" max-h-15rem overflow-y-auto rounded-lg border="1 gray-500/20">
      <li
        v-for="(candidate, index) in results" :id="`picker-option-${index}`" :key="candidate.id"
        role="option" :aria-selected="picked?.id === candidate.id"
        flex cursor-pointer items-center justify-between gap-3 px-3 py-2
        :class="[
          index === highlighted ? 'bg-teal-500/12' : 'hover:bg-gray-500/8',
          picked?.id === candidate.id ? 'font-bold text-teal-700 dark:text-teal-300' : '',
        ]"
        @mouseenter="highlighted = index" @click="pick(candidate)"
      >
        <span>{{ candidate.name }}</span>
        <span shrink-0 text-sm opacity-60>{{ candidate.detail }}</span>
      </li>
      <li v-if="!results.length" px-3 py-4 text-center text-sm opacity-60>
        {{ query ? t('component-picker.no_result', { query }) : t('component-picker.empty') }}
      </li>
      <li v-if="hiddenCount > 0" px-3 py-2 text-center text-xs opacity-60>
        {{ t('component-picker.more', { count: hiddenCount }) }}
      </li>
    </ul>

    <!-- quantité pour l'élément choisi -->
    <div v-if="picked" flex flex-wrap items-center gap-2 rounded-lg px-3 py-2 bg="teal-500/8">
      <span flex-1 font-bold>{{ picked.name }}</span>
      <NInputNumber
        ref="quantityInput" v-model:value="quantity" :min="0" w-9rem
        :placeholder="t('recipe-wizard.quantity')" @keydown.enter.prevent="add"
      />
      <NSelect v-model:value="unit" :options="unitOptions" w-7rem />
      <NButton type="primary" :disabled="!canAdd" @click="add">
        {{ t('recipe-wizard.add') }}
      </NButton>
    </div>
    <p v-else text-sm opacity-60>
      {{ t('component-picker.hint') }}
    </p>
  </div>
</template>
