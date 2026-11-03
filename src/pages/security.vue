<script setup lang="ts">
import type { Authenticator } from '~/composables/allauth'
import { NAlert, NButton, NCard, NCheckbox, NInput, NModal, NQrCode, NTag, useNotification } from 'naive-ui'
import { allauth, createCredential, ReauthenticationRequired, webauthnSupported } from '~/composables/allauth'

// Page « Sécurité » : chaque utilisateur choisit ses méthodes de double authentification.
const { t } = useI18n()
const auth = useAuthStore()
const notification = useNotification()

const authenticators = ref<Authenticator[]>([])
const emailVerified = ref(true)
const loading = ref(false)
const error = ref('')

const totp = computed(() => authenticators.value.find(a => a.type === 'totp'))
const recovery = computed(() => authenticators.value.find(a => a.type === 'recovery_codes'))
const keys = computed(() => authenticators.value.filter(a => a.type === 'webauthn'))
const mfaEnabled = computed(() => !!totp.value || keys.value.length > 0)

async function refresh() {
  const [emails, list] = await Promise.all([
    allauth<{ email: string, verified: boolean, primary: boolean }[]>('/account/email'),
    allauth<Authenticator[]>('/account/authenticators'),
  ])
  emailVerified.value = emails.data?.find(e => e.primary)?.verified ?? false
  authenticators.value = list.data ?? []
}

// ANCHOR - ré-authentification : allauth exige le mot de passe récent pour gérer la MFA
const reauthOpen = ref(false)
const reauthPassword = ref('')
let pendingAction: (() => Promise<void>) | null = null

async function guarded(action: () => Promise<void>) {
  error.value = ''
  loading.value = true
  try {
    await action()
  }
  catch (e) {
    if (e instanceof ReauthenticationRequired) {
      pendingAction = action
      reauthOpen.value = true
    }
    else {
      error.value = e instanceof Error
        ? e.message
        : String(e)
    }
  }
  finally {
    loading.value = false
  }
}

async function confirmReauth() {
  try {
    await auth.reauthenticate(reauthPassword.value)
    reauthOpen.value = false
    reauthPassword.value = ''
    if (pendingAction)
      await guarded(pendingAction)
  }
  catch (e) {
    error.value = e instanceof Error
      ? e.message
      : String(e)
    reauthOpen.value = false
  }
}

// ANCHOR - e-mail
function resendVerification() {
  return guarded(async () => {
    await allauth('/account/email', {
      method: 'PUT',
      body: { email: auth.user?.email },
    })
    notification.success({
      title: t('mfa.email_sent'),
      duration: 3000,
    })
  })
}

// ANCHOR - application d'authentification (TOTP)
const totpSetup = ref<{ secret: string, url: string } | null>(null)
const totpCode = ref('')

function startTotp() {
  return guarded(async () => {
    const res = await allauth('/account/authenticators/totp', {}, [404])
    totpSetup.value = { secret: res.meta?.secret, url: res.meta?.totp_url }
  })
}

function activateTotp() {
  return guarded(async () => {
    await allauth('/account/authenticators/totp', {
      method: 'POST',
      body: {
        code: totpCode.value.replace(/\s/g, ''),
      },
    })
    totpSetup.value = null
    totpCode.value = ''
    await refresh()
    notification.success({
      title: t('mfa.totp_enabled'),
      duration: 3000,
    })
    await showRecoveryCodes()
  })
}

function disableTotp() {
  return guarded(async () => {
    await allauth('/account/authenticators/totp', { method: 'DELETE' })
    await refresh()
  })
}

// ANCHOR - codes de secours
const recoveryCodes = ref<string[] | null>(null)

function showRecoveryCodes() {
  return guarded(async () => {
    const res = await allauth<Authenticator>('/account/authenticators/recovery-codes', {}, [404])
    recoveryCodes.value = res.data?.unused_codes ?? null
  })
}

function regenerateRecoveryCodes() {
  return guarded(async () => {
    const res = await allauth<Authenticator>('/account/authenticators/recovery-codes', { method: 'POST' })
    recoveryCodes.value = res.data?.unused_codes ?? null
    await refresh()
  })
}

// ANCHOR - clés de sécurité / passkeys (WebAuthn)
const canUseKeys = webauthnSupported()
const keyName = ref('')
const keyPasswordless = ref(true)

function addKey() {
  return guarded(async () => {
    const query = keyPasswordless.value ? '?passwordless' : ''
    const options = await allauth(`/account/authenticators/webauthn${query}`)
    const credential = await createCredential(options.data.creation_options)
    const res = await allauth('/account/authenticators/webauthn', {
      method: 'POST',
      body: { name: keyName.value || t('mfa.key_default_name'), credential, passwordless: keyPasswordless.value },
    })
    keyName.value = ''
    await refresh()
    notification.success({
      title: t('mfa.key_added'),
      duration: 3000,
    })
    if (res.meta?.recovery_codes_generated)
      await showRecoveryCodes()
  })
}

function removeKey(id?: number) {
  if (!id)
    return
  return guarded(async () => {
    await allauth('/account/authenticators/webauthn', {
      method: 'DELETE',
      body: {
        authenticators: [id],
      },
    })
    await refresh()
  })
}

function formatDate(timestamp: number | null) {
  return timestamp
    ? new Date(timestamp * 1000).toLocaleDateString()
    : '—'
}

onMounted(() => guarded(refresh))
</script>

<template>
  <div mx-auto max-w-48rem flex flex-col gap-4 text-left>
    <h1 text-center text-5xl>
      {{ t('mfa.title') }}
    </h1>
    <p text-center opacity-80>
      {{ t('mfa.intro') }}
    </p>

    <NAlert v-if="error" type="error" closable @close="error = ''">
      {{ error }}
    </NAlert>

    <NAlert v-if="!emailVerified" type="warning" :title="t('mfa.email_unverified_title')">
      {{ t('mfa.email_unverified') }}
      <NButton size="small" ml-2 :loading="loading" @click="resendVerification">
        {{ t('mfa.resend_email') }}
      </NButton>
    </NAlert>

    <!-- Application d'authentification -->
    <NCard :title="t('mfa.totp_title')">
      <template #header-extra>
        <NTag v-if="totp" type="success">
          {{ t('mfa.enabled') }}
        </NTag>
      </template>
      <p mb-3 text-sm opacity-80>
        {{ t('mfa.totp_help') }}
      </p>
      <div v-if="totp" flex items-center justify-between>
        <span text-sm>{{ t('mfa.last_used') }} : {{ formatDate(totp.last_used_at) }}</span>
        <NButton type="error" ghost :loading="loading" @click="disableTotp">
          {{ t('mfa.disable') }}
        </NButton>
      </div>
      <div v-else-if="totpSetup" flex="~ col md:row" items-center gap-6>
        <NQrCode :value="totpSetup.url" :size="160" />
        <div flex flex-1 flex-col gap-2>
          <p text-sm>
            {{ t('mfa.totp_scan') }}
          </p>
          <code break-all rounded bg-gray-100 p-2 text-xs dark:bg-gray-800>{{ totpSetup.secret }}</code>
          <NInput
            v-model:value="totpCode" placeholder="123456"
            :input-props="{ autocomplete: 'one-time-code', inputmode: 'numeric' }"
            @keydown.enter="activateTotp"
          />
          <NButton type="primary" :disabled="!totpCode" :loading="loading" @click="activateTotp">
            {{ t('mfa.activate') }}
          </NButton>
        </div>
      </div>
      <NButton v-else type="primary" :disabled="!emailVerified" :loading="loading" @click="startTotp">
        {{ t('mfa.setup') }}
      </NButton>
    </NCard>

    <!-- Clés de sécurité / passkeys -->
    <NCard :title="t('mfa.keys_title')">
      <template #header-extra>
        <NTag v-if="keys.length" type="success">
          {{ keys.length }}
        </NTag>
      </template>
      <p mb-3 text-sm opacity-80>
        {{ t('mfa.keys_help') }}
      </p>
      <ul v-if="keys.length" mb-4 flex flex-col gap-2>
        <li v-for="key in keys" :key="key.id" flex items-center justify-between gap-2>
          <span>
            <div i-carbon-password mr-1 inline-block />
            {{ key.name }}
            <NTag v-if="key.is_passwordless" size="small" ml-1>passkey</NTag>
          </span>
          <span text-xs opacity-70>{{ t('mfa.last_used') }} : {{ formatDate(key.last_used_at) }}</span>
          <NButton size="small" type="error" ghost :loading="loading" @click="removeKey(key.id)">
            {{ t('mfa.remove') }}
          </NButton>
        </li>
      </ul>
      <NAlert v-if="!canUseKeys" type="info">
        {{ t('mfa.keys_unsupported') }}
      </NAlert>
      <div v-else flex="~ col md:row" items-center gap-3>
        <NInput v-model:value="keyName" :placeholder="t('mfa.key_name')" />
        <NCheckbox v-model:checked="keyPasswordless" shrink-0>
          {{ t('mfa.passwordless') }}
        </NCheckbox>
        <NButton type="primary" shrink-0 :disabled="!emailVerified" :loading="loading" @click="addKey">
          {{ t('mfa.add_key') }}
        </NButton>
      </div>
    </NCard>

    <!-- Codes de secours -->
    <NCard :title="t('mfa.recovery_title')">
      <p mb-3 text-sm opacity-80>
        {{ t('mfa.recovery_help') }}
      </p>
      <template v-if="mfaEnabled && recovery">
        <p mb-3 text-sm>
          {{ t('mfa.recovery_left', { left: recovery.unused_code_count, total: recovery.total_code_count }) }}
        </p>
        <div v-if="recoveryCodes" grid="~ cols-2 gap-2" mb-3 rounded bg-gray-100 p-3 font-mono dark:bg-gray-800>
          <span v-for="code in recoveryCodes" :key="code">{{ code }}</span>
        </div>
        <div flex gap-2>
          <NButton :loading="loading" @click="showRecoveryCodes">
            {{ t('mfa.show_codes') }}
          </NButton>
          <NButton :loading="loading" @click="regenerateRecoveryCodes">
            {{ t('mfa.regenerate_codes') }}
          </NButton>
        </div>
      </template>
      <p v-else text-sm italic opacity-70>
        {{ t('mfa.recovery_needs_mfa') }}
      </p>
    </NCard>

    <NModal v-model:show="reauthOpen" preset="dialog" :title="t('mfa.reauth_title')" :positive-text="t('button.confirm')" :negative-text="t('button.cancel')" @positive-click="confirmReauth">
      <p mb-2 text-sm>
        {{ t('mfa.reauth_help') }}
      </p>
      <NInput v-model:value="reauthPassword" type="password" show-password-on="click" @keydown.enter="confirmReauth" />
    </NModal>
  </div>
</template>
