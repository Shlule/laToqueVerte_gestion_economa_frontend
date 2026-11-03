/// <reference types="vite/client" />
/// <reference types="vite-plugin-vue-layouts-next/client" />

interface ImportMetaEnv {
  /** URL de base de l'API REST, ex. http://localhost:3000/api */
  readonly VITE_API_URL?: string
  /** URL de base des endpoints django-allauth (navigateur) */
  readonly VITE_AUTH_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'vue-router' {
  interface RouteMeta {
    /** page accessible sans être connecté */
    public?: boolean
    layout?: string
  }
}

export {}
