<script setup lang="ts" generic="T">
import type { UseQueryReturnType } from '@tanstack/vue-query'

// props typées de façon générique
const props = defineProps<{
  query: UseQueryReturnType<T[] | undefined, Error>
}>()

const isNotData = computed(() => props.query.data.value?.length === 0)
</script>

<template>
  <div v-if="isNotData">
    there is no Data
  </div>
  <div v-else-if="query.isLoading.value">
    Loading...
    <NSpin />
  </div>
  <div v-else-if="query.error.value">
    Error: {{ query.error }}
  </div>
  <div v-else>
    <slot />
  </div>
</template>
