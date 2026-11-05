<script setup lang="ts">
import { darkTheme, NConfigProvider, NDialogProvider, NNotificationProvider } from 'naive-ui'
import { naiveThemeOverrides } from './styles/naiveThemeOverrides'

const currentTheme = computed(() => isDark.value ? darkTheme : undefined)

useHead({
  title: 'La Toque Verte – Gestion',
  meta: [
    { name: 'description', content: 'Gestion des recettes, ingrédients et stocks de la pâtisserie' },
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
    <NNotificationProvider>
      <NDialogProvider>
        <RouterView />
      </NDialogProvider>
    </NNotificationProvider>
  </NConfigProvider>
</template>
