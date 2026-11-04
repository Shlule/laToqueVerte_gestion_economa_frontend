import type { UserModule } from './types'
import { createHead } from '@unhead/vue/client'
import { setupLayouts } from 'virtual:generated-layouts'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { handleHotUpdate, routes } from 'vue-router/auto-routes'
import App from './App.vue'

// version « compat » : ne retire pas le fond des boutons Naive UI
import '@unocss/reset/tailwind-compat.css'
import './styles/main.css'
import 'uno.css'

const app = createApp(App)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
})

if (import.meta.hot)
  handleHotUpdate(router)

app.use(router)
app.use(createHead())

// installe tous les modules de `src/modules/` (pinia, i18n, tanstack query…)
Object.values(import.meta.glob<{ install: UserModule }>('./modules/*.ts', { eager: true }))
  .forEach(i => i.install?.({ app, router }))

app.mount('#app')
