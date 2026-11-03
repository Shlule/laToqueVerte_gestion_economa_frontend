import type { AllauthResponse, AuthFlow, AuthUser } from '~/composables/allauth'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { allauthRaw, getCredential } from '~/composables/allauth'
import { getCsrfToken } from '~/composables/apiService'

// Session utilisateur via django-allauth (headless).
// Une connexion peut se faire en deux étapes : mot de passe, puis second facteur (MFA).
export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const checked = ref(false)
  /** Étape en attente après le mot de passe, ex. { id: 'mfa_authenticate', types: ['totp', 'webauthn'] } */
  const pendingFlow = ref<AuthFlow | null>(null)
  const isAuthenticated = computed(() => !!user.value)

  function applyResponse(res: AllauthResponse) {
    checked.value = true
    const authenticated = res.status === 200 && res.meta?.is_authenticated
    user.value = authenticated
      ? res.data?.user ?? null
      : null
    pendingFlow.value = !authenticated
      ? (res.data?.flows as AuthFlow[] | undefined)?.find(f => f.is_pending) ?? null
      : null
    if (res.status === 400 && res.errors?.length)
      throw new Error(res.errors.map(e => e.message).join(' '))
    if (res.status >= 500)
      throw new Error('Le serveur d\'authentification ne répond pas.')
    return user.value
  }

  async function ensureCsrf() {
    if (!getCsrfToken())
      await fetchSession()
  }

  /** Récupère la session courante (pose aussi le cookie CSRF). */
  async function fetchSession() {
    try {
      return applyResponse(await allauthRaw('/auth/session'))
    }
    catch {
      checked.value = true
      user.value = null
      return null
    }
  }

  async function login(email: string, password: string) {
    await ensureCsrf()
    return applyResponse(await allauthRaw('/auth/login', {
      method: 'POST',
      body: { email, password },
    }))
  }

  async function signup(email: string, password: string) {
    await ensureCsrf()
    return applyResponse(await allauthRaw('/auth/signup', {
      method: 'POST',
      body: { email, password },
    }))
  }

  /** Second facteur : code de l'application ou code de secours. */
  async function authenticateWithCode(code: string) {
    return applyResponse(await allauthRaw('/auth/2fa/authenticate', {
      method: 'POST',
      body: { code },
    }))
  }

  /** Second facteur : clé de sécurité / passkey. */
  async function authenticateWithKey() {
    const options = await allauthRaw('/auth/webauthn/authenticate')
    const credential = await getCredential(options.data.request_options)
    return applyResponse(await allauthRaw('/auth/webauthn/authenticate', {
      method: 'POST',
      body: { credential },
    }))
  }

  /** Connexion directe avec une passkey, sans mot de passe. */
  async function loginWithPasskey() {
    await ensureCsrf()
    const options = await allauthRaw('/auth/webauthn/login')
    const credential = await getCredential(options.data.request_options)
    return applyResponse(await allauthRaw('/auth/webauthn/login', {
      method: 'POST',
      body: { credential },
    }))
  }

  /** Confirme le mot de passe avant une action sensible (gestion de la MFA). */
  async function reauthenticate(password: string) {
    const res = await allauthRaw('/auth/reauthenticate', {
      method: 'POST',
      body: { password },
    })
    if (res.status !== 200)
      throw new Error(res.errors?.map(e => e.message).join(' ') || 'Mot de passe incorrect.')
  }

  async function verifyEmail(key: string) {
    await ensureCsrf()
    return applyResponse(await allauthRaw('/auth/email/verify', {
      method: 'POST',
      body: { key },
    }))
  }

  async function logout() {
    await allauthRaw('/auth/session', { method: 'DELETE' })
    user.value = null
    pendingFlow.value = null
  }

  function cancelPendingFlow() {
    pendingFlow.value = null
  }

  return {
    user,
    checked,
    pendingFlow,
    isAuthenticated,
    fetchSession,
    login,
    signup,
    authenticateWithCode,
    authenticateWithKey,
    loginWithPasskey,
    reauthenticate,
    verifyEmail,
    logout,
    cancelPendingFlow,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore as any, import.meta.hot))
