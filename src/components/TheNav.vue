<script setup lang="ts">
import { availableLocales, loadLanguageAsync } from '~/modules/i18n'

const { t, locale } = useI18n()
const auth = useAuthStore()
const router = useRouter()

async function logout() {
  await auth.logout()
  router.push('/login')
}

async function toggleLocales() {
  const newLocale = availableLocales[(availableLocales.indexOf(locale.value) + 1) % availableLocales.length]
  await loadLanguageAsync(newLocale)
}
</script>

<template>
  <nav flex="~ gap-6 items-center" justify-center py-4 text-lg>
    <RouterLink to="/ingredient/home" active-class="text-teal-600 font-bold" hover:text-teal-600>
      {{ t('ingredient-header.title') }}
    </RouterLink>
    <RouterLink to="/recipe/home" active-class="text-teal-600 font-bold" hover:text-teal-600>
      {{ t('recipe-header.title') }}
    </RouterLink>

    <div flex="~ gap-3" ml-6 text-xl>
      <button icon-btn :title="t('button.toggle_dark')" @click="toggleDark()">
        <div i="carbon-sun dark:carbon-moon" />
      </button>
      <button icon-btn :title="t('button.toggle_langs')" @click="toggleLocales()">
        <div i-carbon-language />
      </button>
      <RouterLink v-if="auth.user" icon-btn to="/security" :title="t('mfa.title')">
        <div i-carbon-security />
      </RouterLink>
      <button v-if="auth.user" icon-btn :title="`${t('auth.logout')} (${auth.user.email})`" @click="logout()">
        <div i-carbon-logout />
      </button>
    </div>
  </nav>
</template>
