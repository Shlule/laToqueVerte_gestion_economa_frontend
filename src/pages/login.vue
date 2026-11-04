<script setup lang="ts">
import { NAlert, NButton, NCard, NDivider, NForm, NFormItem, NInput } from 'naive-ui'

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
const emailConfirm = ref('')
const passwordConfirm = ref('')
const code = ref('')
const error = ref('')
const loading = ref(false)
const canUseKeys = webauthnSupported()

// second facteur demandé par allauth après le mot de passe
const mfaStep = computed(() => auth.pendingFlow?.id === 'mfa_authenticate')
const mfaTypes = computed(() => auth.pendingFlow?.types ?? [])

const isSignup = computed(() => mode.value === 'signup')
// confirmations demandées uniquement à l'inscription (évite les fautes de frappe)
const emailMismatch = computed(() => isSignup.value && !!emailConfirm.value
  && emailConfirm.value.trim().toLowerCase() !== email.value.trim().toLowerCase())
const passwordMismatch = computed(() => isSignup.value && !!passwordConfirm.value && passwordConfirm.value !== password.value)
const canSubmit = computed(() => !!email.value && !!password.value && (!isSignup.value
  || (!!emailConfirm.value && !!passwordConfirm.value && !emailMismatch.value && !passwordMismatch.value)))

function toggleMode() {
  mode.value = isSignup.value ? 'login' : 'signup'
  emailConfirm.value = ''
  passwordConfirm.value = ''
  error.value = ''
}

function goToApp() {
  const redirect = typeof route.query.redirect === 'string'
    ? route.query.redirect
    : '/'
  router.replace(redirect)
}

async function run(action: () => Promise<unknown>) {
  error.value = ''
  loading.value = true
  try {
    await action()
    if (auth.isAuthenticated)
      goToApp()
    else if (auth.pendingFlow?.id === 'verify_email')
      error.value = t('auth.verify_email_pending')
    else if (!auth.pendingFlow)
      error.value = t('auth.error_generic')
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

function submit() {
  if (!canSubmit.value)
    return
  const cleanEmail = email.value.trim()
  return run(() => isSignup.value
    ? auth.signup(cleanEmail, password.value)
    : auth.login(cleanEmail, password.value))
}

function submitCode() {
  return run(() => auth.authenticateWithCode(code.value.replace(/\s/g, '')))
}

function cancelMfa() {
  auth.cancelPendingFlow()
  code.value = ''
  error.value = ''
}
</script>

<template>
  <!-- Étape 2 : second facteur -->
  <NCard v-if="mfaStep" :title="t('mfa.login_title')" max-w-24rem w-full>
    <p mb-4 text-sm opacity-80>
      {{ t('mfa.login_help') }}
    </p>
    <NForm v-if="mfaTypes.includes('totp') || mfaTypes.includes('recovery_codes')" @submit.prevent="submitCode">
      <NFormItem :label="t('mfa.code')">
        <NInput
          v-model:value="code" :input-props="{ autocomplete: 'one-time-code', inputmode: 'numeric' }"
          placeholder="123456" autofocus @keydown.enter="submitCode"
        />
      </NFormItem>
      <NButton type="primary" block attr-type="submit" :loading="loading" :disabled="!code">
        {{ t('mfa.verify') }}
      </NButton>
    </NForm>
    <template v-if="mfaTypes.includes('webauthn') && canUseKeys">
      <NDivider>{{ t('mfa.or') }}</NDivider>
      <NButton block :loading="loading" @click="run(auth.authenticateWithKey)">
        <div i-carbon-password mr-2 />
        {{ t('mfa.use_key') }}
      </NButton>
    </template>
    <NAlert v-if="error" type="error" mt-4>
      {{ error }}
    </NAlert>
    <button mt-4 w-full text-sm text-teal-600 hover:underline @click="cancelMfa">
      {{ t('button.back') }}
    </button>
  </NCard>

  <!-- Étape 1 : e-mail + mot de passe -->
  <NCard v-else :title="mode === 'login' ? t('auth.login_title') : t('auth.signup_title')" max-w-24rem w-full>
    <NForm @submit.prevent="submit">
      <NFormItem :label="t('auth.email')">
        <NInput v-model:value="email" type="text" :input-props="{ type: 'email', autocomplete: 'email webauthn' }" />
      </NFormItem>
      <template v-if="isSignup">
        <NFormItem
          :label="t('auth.email_confirm')"
          :validation-status="emailMismatch ? 'error' : undefined"
          :feedback="emailMismatch ? t('auth.email_mismatch') : undefined"
        >
          <NInput
            v-model:value="emailConfirm" type="text"
            :input-props="{ type: 'email', autocomplete: 'off' }"
          />
        </NFormItem>
      </template>
      <NFormItem :label="t('auth.password')">
        <NInput
          v-model:value="password" type="password" show-password-on="click"
          :input-props="{ autocomplete: mode === 'login' ? 'current-password' : 'new-password' }"
          @keydown.enter="submit"
        />
      </NFormItem>
      <template v-if="isSignup">
        <NFormItem
          :label="t('auth.password_confirm')"
          :validation-status="passwordMismatch ? 'error' : undefined"
          :feedback="passwordMismatch ? t('auth.password_mismatch') : undefined"
        >
          <NInput
            v-model:value="passwordConfirm" type="password" show-password-on="click"
            :input-props="{ autocomplete: 'new-password' }"
            @keydown.enter="submit"
          />
        </NFormItem>
      </template>
      <NAlert v-if="error" type="error" mb-4>
        {{ error }}
      </NAlert>
      <NButton type="primary" block attr-type="submit" :loading="loading" :disabled="!canSubmit">
        {{ mode === 'login' ? t('auth.login') : t('auth.signup') }}
      </NButton>
    </NForm>
    <template v-if="mode === 'login' && canUseKeys">
      <NDivider>{{ t('mfa.or') }}</NDivider>
      <NButton block :loading="loading" @click="run(auth.loginWithPasskey)">
        <div i-carbon-password mr-2 />
        {{ t('mfa.passkey_login') }}
      </NButton>
    </template>
    <button mt-4 w-full text-sm text-teal-600 hover:underline @click="toggleMode">
      {{ mode === 'login' ? t('auth.to_signup') : t('auth.to_login') }}
    </button>
  </NCard>
</template>
