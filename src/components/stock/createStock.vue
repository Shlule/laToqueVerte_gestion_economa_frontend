<script setup lang="ts">
import { NModal } from 'naive-ui'

const props = defineProps<{ showCreateStock: boolean }>()
const show = useVModel(props, 'showCreateStock')
</script>

<template>
  <div>
    <NModal v-model:show="show">
      <n-card
        style="width: 600px"
        title="Modal"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          Oops!
        </template>
        Content
        <template #footer>
          Footer
        </template>
      </n-card>
    </NModal>
  </div>
</template>

<style scoped>

</style>
