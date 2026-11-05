<script setup lang="ts">
import type { PickedComponent } from './componentPicker.vue'
import type { ComposedRecipe, RecipeCompose, Unit } from '~/types'
import { useQueryClient } from '@tanstack/vue-query'
import { NButton, NCard, NEmpty, NInput, NInputNumber, NRadioButton, NRadioGroup, NSelect, NStep, NSteps, NSwitch, useNotification } from 'naive-ui'
import { composeRecipe } from '~/composables/apiService'
import { formatDuration } from '~/composables/cooking'
import { formatPrice } from '~/composables/money'

// Assistant de création de recette en 4 étapes :
// 1. infos  2. composition (ingrédients et préparations)  3. procédé (facultatif)  4. récapitulatif
// Le coût affiché vient du serveur (aperçu `dryRun`) : c'est exactement celui qui sera enregistré.

const show = defineModel<boolean>('showCreateIngredient', { required: true })

const { t } = useI18n()
const notification = useNotification()
const queryClient = useQueryClient()

const STEPS = 5
const step = ref(1)
const direction = ref<'next' | 'prev'>('next')

// ANCHOR - étape 1 : infos
const name = ref('')
const mode = ref<'pieces' | 'weight'>('pieces')
const quantity = ref<number | null>(8)
const weightUnit = ref<Unit>('kg')
const unitType = computed<Unit>(() => mode.value === 'pieces'
  ? 'unit'
  : weightUnit.value)

// ANCHOR - étape 2 : composition
interface Line {
  key: string
  kind: 'ingredient' | 'recipe'
  id: string
  name: string
  quantityNeeded: number
  unit: Unit
}
const lines = ref<Line[]>([])
function unitLabel(unit: Unit) {
  return unit === 'unit'
    ? t('recipe-wizard.unit_piece')
    : unit
}

function addLine(component: PickedComponent) {
  lines.value.push({
    key: crypto.randomUUID(),
    ...component,
  })
}

function removeLine(key: string) {
  lines.value = lines.value.filter(line => line.key !== key)
}

// ANCHOR - étape 3 : procédé
const steps = ref<string[]>([''])

function addStep() {
  steps.value.push('')
}
function removeStep(index: number) {
  steps.value.splice(index, 1)
  if (!steps.value.length)
    steps.value.push('')
}
function moveStep(index: number, delta: -1 | 1) {
  const target = index + delta
  if (target < 0 || target >= steps.value.length)
    return
  const [item] = steps.value.splice(index, 1)
  steps.value.splice(target, 0, item)
}

// ANCHOR - aperçu du coût, calculé par le serveur
// ANCHOR - étape 4 : cuisson
const baked = ref(true)
const cookingTime = ref<number | null>(null)
const cookingTemperature = ref<number | null>(null)
// temps de travail (main d'œuvre), compté dans le coût de revient
const laborTime = ref<number | null>(null)
// raccourcis pratiques en pâtisserie
const temperaturePresets = [150, 160, 170, 180, 200]

const payload = computed<RecipeCompose>(() => ({
  name: name.value.trim() || t('recipe-wizard.untitled'),
  quantity: quantity.value ?? 1,
  unitType: unitType.value,
  ingredients: lines.value.filter(l => l.kind === 'ingredient').map(l => ({ ingredient: l.id, quantityNeeded: l.quantityNeeded, unit: l.unit })),
  subRecipes: lines.value.filter(l => l.kind === 'recipe').map(l => ({ childRecipe: l.id, quantityNeeded: l.quantityNeeded, unit: l.unit })),
  steps: steps.value.map(s => s.trim()).filter(Boolean),
  cookingTime: baked.value ? cookingTime.value : null,
  cookingTemperature: baked.value ? cookingTemperature.value : null,
  laborTime: laborTime.value || null,
}))

const preview = ref<ComposedRecipe | null>(null)
const previewError = ref('')
const previewLoading = ref(false)

const refreshPreview = useDebounceFn(async () => {
  if (!lines.value.length || !(quantity.value && quantity.value > 0)) {
    preview.value = null
    return
  }
  previewLoading.value = true
  try {
    preview.value = await composeRecipe({ ...payload.value, dryRun: true })
    previewError.value = ''
  }
  catch (e) {
    previewError.value = e instanceof Error
      ? e.message
      : String(e)
  }
  finally {
    previewLoading.value = false
  }
}, 250)

watch(() => [lines.value.length, quantity.value, unitType.value], refreshPreview, { deep: true })

/** Coût d'une ligne, dans l'ordre renvoyé par le serveur (ingrédients puis préparations). */
function lineCost(line: Line) {
  if (!preview.value)
    return
  const sameKind = lines.value.filter(l => l.kind === line.kind)
  const index = sameKind.indexOf(line)
  const costs = line.kind === 'ingredient'
    ? preview.value.recipeIngredients
    : preview.value.subRecipes
  return costs[index]?.cost
}

const perUnitLabel = computed(() => mode.value === 'pieces'
  ? t('recipe-wizard.per_piece')
  : t('recipe-wizard.per_unit', { unit: unitType.value }))

// ANCHOR - navigation
const stepValid = computed(() => {
  switch (step.value) {
    case 1: return !!name.value.trim() && (quantity.value ?? 0) > 0
    case 2: return lines.value.length > 0
    case 4: return !baked.value || (!!cookingTime.value && !!cookingTemperature.value)
    default: return true
  }
})

function go(target: number) {
  if (target < 1 || target > STEPS)
    return
  // on ne saute pas une étape invalide en avançant
  if (target > step.value && !stepValid.value)
    return
  direction.value = target > step.value
    ? 'next'
    : 'prev'
  step.value = target
  if (target === STEPS)
    refreshPreview()
}

function reset() {
  step.value = 1
  name.value = ''
  mode.value = 'pieces'
  quantity.value = 8
  lines.value = []
  steps.value = ['']
  baked.value = true
  cookingTime.value = null
  cookingTemperature.value = null
  laborTime.value = null
  preview.value = null
  previewError.value = ''
}

function close() {
  show.value = false
  reset()
}

const saving = ref(false)
async function save() {
  saving.value = true
  try {
    const created = await composeRecipe(payload.value)
    await queryClient.invalidateQueries({
      queryKey: ['allRecipes'],
    })
    notification.success({
      title: t('recipe-wizard.created', { name: created?.name }),
      content: `${t('recipe-wizard.total_cost')} : ${formatPrice(created?.cost)}`,
      duration: 3000,
    })
    close()
  }
  catch (e) {
    notification.error({
      title: t('recipe-wizard.error'),
      content: e instanceof Error
        ? e.message
        : String(e),
      duration: 5000,
    })
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <NCard role="dialog" :title="t('recipe-wizard.title')" max-w-48rem w-92vw :segmented="{ content: true, footer: 'soft' }">
    <template #header-extra>
      <button icon-btn :title="t('button.cancel')" @click="close">
        <div i-material-symbols:close-rounded />
      </button>
    </template>

    <NSteps :current="step" size="small" mb-6>
      <NStep :title="t('recipe-wizard.step_info')" @click="go(1)" />
      <NStep :title="t('recipe-wizard.step_composition')" @click="go(2)" />
      <NStep :title="t('recipe-wizard.step_process')" @click="go(3)" />
      <NStep :title="t('recipe-wizard.step_cooking')" @click="go(4)" />
      <NStep :title="t('recipe-wizard.step_summary')" @click="go(5)" />
    </NSteps>

    <div relative min-h-18rem overflow-hidden>
      <Transition :name="`slide-${direction}`" mode="out-in">
        <!-- 1. Infos -->
        <section v-if="step === 1" key="1" flex flex-col gap-4>
          <label flex flex-col gap-1>
            <span text-sm opacity-80>{{ t('recipe-wizard.name') }}</span>
            <NInput v-model:value="name" :placeholder="t('recipe-wizard.name_placeholder')" autofocus />
          </label>
          <div flex flex-col gap-1>
            <span text-sm opacity-80>{{ t('recipe-wizard.yield') }}</span>
            <NRadioGroup v-model:value="mode">
              <NRadioButton value="pieces" :label="t('recipe-option.number_of_piece')" />
              <NRadioButton value="weight" :label="t('recipe-option.weight')" />
            </NRadioGroup>
          </div>
          <div flex items-center gap-2>
            <NInputNumber v-model:value="quantity" :min="0.001" :step="1" w-12rem :placeholder="t('recipe-wizard.quantity')" />
            <NSelect
              v-if="mode === 'weight'" v-model:value="weightUnit" w-8rem
              :options="[{ value: 'kg', label: 'kg' }, { value: 'g', label: 'g' }]"
            />
            <span v-else>{{ t('recipe-wizard.pieces') }}</span>
          </div>
        </section>

        <!-- 2. Composition -->
        <section v-else-if="step === 2" key="2" flex flex-col gap-4>
          <ComponentPicker @add="addLine" />

          <NEmpty v-if="!lines.length" :description="t('recipe-wizard.no_line')" />
          <ul v-else flex flex-col gap-1>
            <li v-for="line in lines" :key="line.key" flex items-center gap-3 rounded-lg px-3 py-2 bg="gray-500/8">
              <div :class="line.kind === 'ingredient' ? 'i-carbon-wheat' : 'i-carbon-book'" opacity-60 />
              <span flex-1>{{ line.name }}</span>
              <span opacity-80>{{ line.quantityNeeded }} {{ unitLabel(line.unit) }}</span>
              <span w-6rem text-right font-mono>{{ lineCost(line) != null ? formatPrice(lineCost(line), 4) : '…' }}</span>
              <button icon-btn :title="t('recipe-wizard.remove')" @click="removeLine(line.key)">
                <div i-fluent:delete-24-regular />
              </button>
            </li>
          </ul>
          <p v-if="previewError" text-sm text-red>
            {{ previewError }}
          </p>
          <p v-else-if="preview" text-right>
            {{ t('recipe-wizard.total_cost') }} : <strong font-mono>{{ formatPrice(preview.cost) }}</strong>
          </p>
        </section>

        <!-- 3. Procédé -->
        <section v-else-if="step === 3" key="3" flex flex-col gap-3>
          <p text-sm opacity-70>
            {{ t('recipe-wizard.process_help') }}
          </p>
          <div v-for="(_, index) in steps" :key="index" flex items-start gap-2>
            <span mt-1 w-6 shrink-0 text-right font-bold>{{ index + 1 }}.</span>
            <NInput
              v-model:value="steps[index]" type="textarea" :autosize="{ minRows: 1, maxRows: 5 }"
              :placeholder="t('recipe-wizard.step_placeholder')"
            />
            <div flex shrink-0 gap-1>
              <button icon-btn :disabled="index === 0" :title="t('recipe-wizard.up')" @click="moveStep(index, -1)">
                <div i-carbon-arrow-up />
              </button>
              <button icon-btn :disabled="index === steps.length - 1" :title="t('recipe-wizard.down')" @click="moveStep(index, 1)">
                <div i-carbon-arrow-down />
              </button>
              <button icon-btn :title="t('recipe-wizard.remove')" @click="removeStep(index)">
                <div i-fluent:delete-24-regular />
              </button>
            </div>
          </div>
          <NButton dashed @click="addStep">
            {{ t('recipe-wizard.add_step') }}
          </NButton>
        </section>

        <!-- 4. Temps et cuisson -->
        <section v-else-if="step === 4" key="4" flex flex-col gap-4>
          <div flex flex-col gap-1>
            <div flex flex-wrap items-center gap-3>
              <div i-carbon-user-activity text-xl opacity-70 />
              <span>{{ t('recipe-wizard.labor_time') }}</span>
              <NInputNumber v-model:value="laborTime" :min="0" :max="10080" :step="5" w-10rem :placeholder="t('recipe-wizard.optional')">
                <template #suffix>
                  min
                </template>
              </NInputNumber>
              <span v-if="laborTime && laborTime >= 60" text-sm opacity-70>= {{ formatDuration(laborTime) }}</span>
            </div>
            <p text-xs opacity-60>
              {{ t('recipe-wizard.labor_time_help') }}
            </p>
          </div>
          <label flex items-center gap-3>
            <NSwitch v-model:value="baked" />
            <span>{{ baked ? t('recipe-wizard.baked') : t('recipe-wizard.not_baked') }}</span>
          </label>
          <template v-if="baked">
            <div flex flex-wrap items-center gap-3>
              <div i-carbon-time text-xl opacity-70 />
              <NInputNumber v-model:value="cookingTime" :min="1" :max="10080" :step="5" w-10rem :placeholder="t('recipe-wizard.cooking_time')">
                <template #suffix>
                  min
                </template>
              </NInputNumber>
              <span v-if="cookingTime && cookingTime >= 60" text-sm opacity-70>= {{ formatDuration(cookingTime) }}</span>
            </div>
            <div flex flex-wrap items-center gap-3>
              <div i-carbon-temperature-hot text-xl opacity-70 />
              <NInputNumber v-model:value="cookingTemperature" :min="1" :max="400" :step="5" w-10rem :placeholder="t('recipe-wizard.cooking_temperature')">
                <template #suffix>
                  °C
                </template>
              </NInputNumber>
              <div flex flex-wrap gap-1>
                <NButton v-for="preset in temperaturePresets" :key="preset" size="small" round secondary :type="cookingTemperature === preset ? 'primary' : 'default'" @click="cookingTemperature = preset">
                  {{ preset }} °C
                </NButton>
              </div>
            </div>
          </template>
        </section>

        <!-- 5. Récapitulatif -->
        <section v-else key="5" flex flex-col gap-4>
          <div flex flex-wrap items-baseline justify-between gap-2>
            <h3 text-2xl>
              {{ name }}
            </h3>
            <span opacity-80>{{ quantity }} {{ mode === 'pieces' ? t('recipe-wizard.pieces') : unitType }}</span>
          </div>
          <p v-if="payload.cookingTime" flex items-center gap-2 opacity-80>
            <span i-carbon-time /> {{ formatDuration(payload.cookingTime) }}
            <span i-carbon-temperature-hot ml-2 /> {{ payload.cookingTemperature }} °C
          </p>
          <p v-if="payload.laborTime" flex items-center gap-2 opacity-80>
            <span i-carbon-user-activity /> {{ t('recipe-wizard.labor_time') }} : {{ formatDuration(payload.laborTime) }}
          </p>

          <table w-full text-left>
            <thead text-sm opacity-60>
              <tr>
                <th font-normal>
                  {{ t('recipe-wizard.component') }}
                </th>
                <th font-normal>
                  {{ t('recipe-wizard.quantity') }}
                </th>
                <th text-right font-normal>
                  {{ t('recipe-wizard.cost') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="line in lines" :key="line.key" border-t="1 gray-500/15">
                <td py-1>
                  {{ line.name }} <span v-if="line.kind === 'recipe'" text-xs opacity-60>({{ t('recipe-wizard.kind_recipe') }})</span>
                </td>
                <td>{{ line.quantityNeeded }} {{ unitLabel(line.unit) }}</td>
                <td text-right font-mono>
                  {{ lineCost(line) != null ? formatPrice(lineCost(line), 4) : '…' }}
                </td>
              </tr>
            </tbody>
          </table>

          <div grid="~ cols-2" gap-3>
            <div rounded-xl p-3 bg="teal-500/10">
              <div text-sm opacity-70>
                {{ t('recipe-wizard.total_cost') }}
              </div>
              <div text-2xl font-mono>
                {{ preview ? formatPrice(preview.cost) : '…' }}
              </div>
              <div v-if="preview" text-xs opacity-60>
                {{ t('recipe-wizard.exact') }} {{ formatPrice(preview.cost, 4) }}
              </div>
            </div>
            <div rounded-xl p-3 bg="teal-500/10">
              <div text-sm opacity-70>
                {{ perUnitLabel }}
              </div>
              <div text-2xl font-mono>
                {{ preview ? formatPrice(preview.costPerUnit) : '…' }}
              </div>
              <div v-if="preview" text-xs opacity-60>
                {{ t('recipe-wizard.exact') }} {{ formatPrice(preview.costPerUnit, 4) }}
              </div>
            </div>
          </div>
          <p v-if="previewError" text-sm text-red>
            {{ previewError }}
          </p>

          <div v-if="payload.steps.length">
            <h4 mb-1 font-bold>
              {{ t('recipe-wizard.step_process') }}
            </h4>
            <ol list-decimal pl-6>
              <li v-for="(text, index) in payload.steps" :key="index" whitespace-pre-line>
                {{ text }}
              </li>
            </ol>
          </div>
        </section>
      </Transition>
    </div>

    <template #footer>
      <div flex items-center justify-between gap-2>
        <NButton quaternary @click="close">
          {{ t('button.cancel') }}
        </NButton>
        <div flex gap-2>
          <NButton v-if="step > 1" @click="go(step - 1)">
            {{ t('recipe-wizard.previous') }}
          </NButton>
          <NButton v-if="step < STEPS" type="primary" :disabled="!stepValid" @click="go(step + 1)">
            {{ (step === 3 && !payload.steps.length) || (step === 4 && !baked) ? t('recipe-wizard.skip') : t('recipe-wizard.next') }}
          </NButton>
          <NButton v-else type="primary" :loading="saving" :disabled="!preview || !!previewError" @click="save">
            {{ t('recipe-wizard.create') }}
          </NButton>
        </div>
      </div>
    </template>
  </NCard>
</template>

<style scoped>
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}
.slide-next-enter-from,
.slide-prev-leave-to {
  transform: translateX(40px);
  opacity: 0;
}
.slide-next-leave-to,
.slide-prev-enter-from {
  transform: translateX(-40px);
  opacity: 0;
}
</style>
