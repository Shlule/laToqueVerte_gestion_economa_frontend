<script setup lang="ts">
import { NConfigProvider, darkTheme } from 'naive-ui'
import { naiveThemeOverrides } from './styles/naiveThemeOverrides'
// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
const isDark = useDark()

const currentTheme = computed(() => {
  return isDark.value ? darkTheme : undefined
})

useHead({
  title: 'Vitesse',
  meta: [
    {
      name: 'description',
      content: 'Opinionated Vite Starter Template',
    },
    {
      name: 'theme-color',
      content: () => isDark.value ? '#00aba9' : '#ffffff',
    },
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: () => preferredDark.value ? '/favicon-dark.svg' : '/favicon.svg',
    },
  ],
})
</script>

<template>
  <NConfigProvider :theme-overrides="naiveThemeOverrides" :theme="currentTheme" h-100dvh>
    <RouterView />
  </NConfigProvider>
</template>
