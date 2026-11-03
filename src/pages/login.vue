<script setup lang="ts">
import { NAlert, NButton, NCard, NForm, NFormItem, NInput } from 'naive-ui'

definePage({
  meta: { public: true, layout: 'blank' },
})

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const mode = ref<'login' | 'signup'>('login')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const user = mode.value === 'login'
      ? await auth.login(email.value, password.value)
      : await auth.signup(email.value, password.value)
    if (!user) {
      error.value = t('auth.error_generic')
      return
    }
    const redirect = typeof route.query.redirect === 'string'
      ? route.query.redirect
      : '/'
    router.replace(redirect)
  }
  catch (e) {
    error.value = e instanceof Error
      ? e.message
      : t('auth.error_generic')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <NCard :title="mode === 'login' ? t('auth.login_title') : t('auth.signup_title')" max-w-24rem w-full>
    <NForm @submit.prevent="submit">
      <NFormItem :label="t('auth.email')">
        <NInput v-model:value="email" type="text" :input-props="{ type: 'email', autocomplete: 'email' }" />
      </NFormItem>
      <NFormItem :label="t('auth.password')">
        <NInput
          v-model:value="password" type="password" show-password-on="click"
          :input-props="{ autocomplete: mode === 'login' ? 'current-password' : 'new-password' }"
          @keydown.enter="submit"
        />
      </NFormItem>
      <NAlert v-if="error" type="error" mb-4>
        {{ error }}
      </NAlert>
      <NButton type="primary" block attr-type="submit" :loading="loading" :disabled="!email || !password">
        {{ mode === 'login' ? t('auth.login') : t('auth.signup') }}
      </NButton>
    </NForm>
    <button mt-4 w-full text-sm text-teal-600 hover:underline @click="mode = mode === 'login' ? 'signup' : 'login'">
      {{ mode === 'login' ? t('auth.to_signup') : t('auth.to_login') }}
    </button>
  </NCard>
</template>
