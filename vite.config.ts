/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import VueI18n from '@intlify/unplugin-vue-i18n/vite'
import Vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import VueDevTools from 'vite-plugin-vue-devtools'
import Layouts from 'vite-plugin-vue-layouts-next'
import { VueRouterAutoImports } from 'vue-router/unplugin'
import VueRouter from 'vue-router/vite'

export default defineConfig({
  resolve: {
    alias: {
      '~/': fileURLToPath(new URL('./src/', import.meta.url)),
    },
  },

  plugins: [
    // Routing par fichiers (intégré à vue-router 5) : src/pages/**
    VueRouter({
      dts: 'src/route-map.d.ts',
    }),

    Vue(),

    // Layouts : src/layouts/*.vue (default.vue par défaut)
    Layouts(),

    AutoImport({
      imports: [
        'vue',
        'vue-i18n',
        '@vueuse/core',
        VueRouterAutoImports,
        {
          '@unhead/vue': ['useHead', 'useSeoMeta'],
        },
      ],
      dts: 'src/auto-imports.d.ts',
      dirs: ['src/composables', 'src/stores'],
      vueTemplate: true,
    }),

    Components({
      resolvers: [
        NaiveUiResolver(),
      ],
      dts: 'src/components.d.ts',
    }),

    // voir uno.config.ts
    Unocss(),

    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      fullInstall: true,
      include: [
        fileURLToPath(new URL('./locales/**', import.meta.url)),
      ],
    }),

    VueDevTools(),
  ],

  // En dev, le front et Django partagent la même origine via ce proxy :
  // pas de CORS, et les cookies de session / CSRF fonctionnent directement.
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/_allauth': 'http://localhost:8000',
    },
  },

  test: {
    include: ['test/**/*.test.ts'],
    environment: 'happy-dom',
  },
})
