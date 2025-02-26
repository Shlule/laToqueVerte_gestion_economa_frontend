<script setup lang="ts">

</script>

<template>
  <Transition name="fadeslide" mode="out-in">
    <slot />
  </Transition>
</template>

<style scoped>
.relative {
  position: relative;
}

.fadeslide-enter-active,
.fadeslide-leave-active {
  transition: 0.5s;
}

.fadeslide-leave-active {
  position: absolute;
  width: 100%;
}

.fadeslide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fadeslide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
