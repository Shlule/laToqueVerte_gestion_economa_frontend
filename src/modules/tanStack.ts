import type { UserModule } from '~/types'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
})

export const install: UserModule = ({ app }) => {
  app.use(VueQueryPlugin, { queryClient, enableDevtoolsV6Plugin: true })
}
