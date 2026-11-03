import { ofetch } from 'ofetch'
import { getCsrfToken } from '~/composables/apiService'

// Client des endpoints django-allauth « headless » (mode navigateur : cookie de session + CSRF).
// Spécification : https://docs.allauth.org/en/latest/headless/openapi-specification/
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_URL ?? '/_allauth/browser/v1'

export interface AuthUser {
  id: number
  email: string
  display: string
}

export interface AuthFlow {
  id: string
  is_pending?: boolean
  types?: string[]
}

export interface AllauthResponse<T = any> {
  status: number
  data?: T
  meta?: Record<string, any>
  errors?: { message: string, param?: string, code?: string }[]
}

export interface Authenticator {
  id?: number
  type: 'totp' | 'recovery_codes' | 'webauthn'
  name?: string
  created_at: number
  last_used_at: number | null
  is_passwordless?: boolean
  unused_code_count?: number
  total_code_count?: number
  unused_codes?: string[]
}

/** Levée quand allauth exige de retaper son mot de passe avant une action sensible. */
export class ReauthenticationRequired extends Error {
  constructor() {
    super('Merci de confirmer ton mot de passe.')
  }
}

/** Levée quand allauth répond une erreur métier (code faux, e-mail non vérifié…). */
export class AllauthError extends Error {
  constructor(public response: AllauthResponse) {
    super(response.errors?.map(e => e.message).join(' ') || `Erreur ${response.status}`)
  }
}

const client = ofetch.create({
  baseURL: AUTH_BASE_URL,
  credentials: 'include',
  // allauth utilise les codes HTTP (401, 404, 409…) comme réponses normales : on les lit nous-mêmes
  ignoreResponseError: true,
  onRequest({ options }) {
    const token = getCsrfToken()
    if (token)
      options.headers.set('X-CSRFToken', token)
  },
})

export function allauthRaw<T = any>(url: string, options: { method?: string, body?: any, query?: any } = {}) {
  return client<AllauthResponse<T>>(url, options as any)
}

/**
 * Appel d'un endpoint de gestion de compte : renvoie la réponse si 2xx,
 * lève `ReauthenticationRequired` si allauth demande de se ré-authentifier.
 */
export async function allauth<T = any>(url: string, options: { method?: string, body?: any } = {}, okStatuses: number[] = []) {
  const res = await allauthRaw<T>(url, options)
  if (res.status >= 200 && res.status < 300)
    return res
  if (okStatuses.includes(res.status))
    return res
  if (res.status === 401 && (res.data as any)?.flows?.some((f: AuthFlow) => f.id.startsWith('reauthenticate') || f.id === 'mfa_reauthenticate'))
    throw new ReauthenticationRequired()
  throw new AllauthError(res)
}

// ANCHOR - WebAuthn (clés de sécurité / passkeys) : conversion JSON <-> API navigateur

export function webauthnSupported() {
  return typeof window !== 'undefined'
    && 'PublicKeyCredential' in window
    && typeof (PublicKeyCredential as any).parseCreationOptionsFromJSON === 'function'
}

export async function createCredential(creationOptions: { publicKey: any }) {
  if (!webauthnSupported())
    throw new Error('Ce navigateur ne gère pas les clés de sécurité.')
  const publicKey = (PublicKeyCredential as any).parseCreationOptionsFromJSON(creationOptions.publicKey)
  const credential = await navigator.credentials.create({ publicKey }) as PublicKeyCredential | null
  if (!credential)
    throw new Error('Création de la clé annulée.')
  return (credential as any).toJSON()
}

export async function getCredential(requestOptions: { publicKey: any }) {
  if (!webauthnSupported())
    throw new Error('Ce navigateur ne gère pas les clés de sécurité.')
  const publicKey = (PublicKeyCredential as any).parseRequestOptionsFromJSON(requestOptions.publicKey)
  const credential = await navigator.credentials.get({ publicKey }) as PublicKeyCredential | null
  if (!credential)
    throw new Error('Authentification annulée.')
  return (credential as any).toJSON()
}
