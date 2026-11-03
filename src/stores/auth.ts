import { ofetch } from 'ofetch'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { getCsrfToken } from '~/composables/apiService'

// Authentification via django-allauth en mode « headless » (API JSON, session navigateur).
// Doc des endpoints : https://docs.allauth.org/en/latest/headless/openapi-specification/
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_URL ?? '/_allauth/browser/v1'

export interface AuthUser {
  id: number
  email: string
  display: string
}

interface AllauthResponse {
  status: number
  data?: { user?: AuthUser }
  meta?: { is_authenticated?: boolean }
  errors?: { message: string, param?: string }[]
}

const allauth = ofetch.create({
  baseURL: AUTH_BASE_URL,
  credentials: 'include',
  // allauth répond 401 quand on n'est pas connecté : ce n'est pas une erreur pour nous
  ignoreResponseError: true,
  onRequest({ options }) {
    const token = getCsrfToken()
    if (token)
      options.headers.set('X-CSRFToken', token)
  },
})

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const checked = ref(false)
  const isAuthenticated = computed(() => !!user.value)

  function applyResponse(res: AllauthResponse) {
    user.value = res.status === 200 && res.meta?.is_authenticated
      ? res.data?.user ?? null
      : null
    checked.value = true
    if (res.status === 400 && res.errors?.length)
      throw new Error(res.errors.map(e => e.message).join(' '))
    if (res.status >= 500)
      throw new Error('Le serveur d\'authentification ne répond pas.')
    return user.value
  }

  /** Récupère la session courante (pose aussi le cookie CSRF). */
  async function fetchSession() {
    try {
      return applyResponse(await allauth<AllauthResponse>('/auth/session'))
    }
    catch {
      checked.value = true
      user.value = null
      return null
    }
  }

  async function login(email: string, password: string) {
    if (!getCsrfToken())
      await fetchSession()
    return applyResponse(await allauth<AllauthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }))
  }

  async function signup(email: string, password: string) {
    if (!getCsrfToken())
      await fetchSession()
    return applyResponse(await allauth<AllauthResponse>('/auth/signup', {
      method: 'POST',
      body: { email, password },
    }))
  }

  async function logout() {
    await allauth('/auth/session', { method: 'DELETE' })
    user.value = null
  }

  return {
    user,
    checked,
    isAuthenticated,
    fetchSession,
    login,
    signup,
    logout,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore as any, import.meta.hot))
