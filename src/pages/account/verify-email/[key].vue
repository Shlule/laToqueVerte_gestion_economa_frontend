<script setup lang="ts">
import { NAlert, NButton, NCard, NSpin } from 'naive-ui'

// Lien reçu par e-mail : /account/verify-email/<clé> (configuré dans HEADLESS_FRONTEND_URLS côté Django)
definePage({
  meta: { public: true, layout: 'blank' },
})

const { t } = useI18n()
const auth = useAuthStore()
const route = useRoute('/account/verify-email/[key]')

const status = ref<'pending' | 'ok' | 'error'>('pending')
const error = ref('')

onMounted(async () => {
  try {
    await auth.verifyEmail(String(route.params.key))
    status.value = 'ok'
  }
  catch (e) {
    error.value = e instanceof Error
      ? e.message
      : String(e)
    status.value = 'error'
  }
})
</script>

<template>
  <NCard :title="t('mfa.verify_email_title')" max-w-24rem w-full>
    <NSpin v-if="status === 'pending'" />
    <NAlert v-else-if="status === 'ok'" type="success">
      {{ t('mfa.verify_email_ok') }}
    </NAlert>
    <NAlert v-else type="error">
      {{ error || t('mfa.verify_email_error') }}
    </NAlert>
    <RouterLink v-if="status !== 'pending'" :to="auth.isAuthenticated ? '/security' : '/login'">
      <NButton type="primary" mt-4 block>
        {{ t('button.back') }}
      </NButton>
    </RouterLink>
  </NCard>
</template>
