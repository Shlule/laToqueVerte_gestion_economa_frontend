<script setup lang="ts">
import { NTabPane, NTabs } from 'naive-ui'

// const [showRecipeBlock, toggleShowRecipeBlock] = useToggle()
</script>

<template>
  <!-- <NCard v-if="showRecipeBlock" :bordered="false" class="transition-all active:scale-102" flex cursor-pointer rounded-2xl shadow-lg dark:ncard-dark hover:shadow-2xl> -->
  <NTabs>
    <NTabPane name="test" tab="'test'">
      tests
    </NTabPane>
  </NTabs>
  <!-- </NCard> -->
</template>

<style scoped>

</style>
