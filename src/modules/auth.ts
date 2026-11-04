import type { UserModule } from '~/types'
import { setUnauthorizedHandler } from '~/composables/apiService'
import { queryClient } from '~/modules/tanStack'
import { useAuthStore } from '~/stores/auth'

// Protège toutes les pages sauf celles marquées `meta.public`.
export const install: UserModule = ({ router }) => {
  router.beforeEach(async (to) => {
    const auth = useAuthStore()
    if (!auth.checked)
      await auth.fetchSession()
    if (to.meta.public) {
      return to.path === '/login' && auth.isAuthenticated
        ? '/'
        : true
    }
    if (!auth.isAuthenticated) {
      return {
        path: '/login',
        query: { redirect: to.fullPath },
      }
    }
    return true
  })

  // Une API qui répond 401/403 ne veut pas forcément dire « session expirée »
  // (ex. 403 = action refusée) : on revérifie la session avant de déconnecter.
  let checking: Promise<unknown> | null = null
  setUnauthorizedHandler(async () => {
    const auth = useAuthStore()
    checking ??= auth.fetchSession().finally(() => {
      checking = null
    })
    await checking
    if (auth.isAuthenticated)
      return
    queryClient.clear()
    const current = router.currentRoute.value
    if (!current.meta.public) {
      router.push({
        path: '/login',
        query: { redirect: current.fullPath },
      })
    }
  })
}
