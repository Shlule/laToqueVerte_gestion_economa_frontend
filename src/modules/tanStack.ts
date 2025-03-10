import { VueQueryPlugin } from '@tanstack/vue-query'
import type { UserModule } from '~/types'

export const install: UserModule = ({ app }) => {
  app.use(VueQueryPlugin, { enableDevtoolsV6Plugin: true })
}
