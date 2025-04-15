import type { UserModule } from '~/types'
import { VueQueryPlugin } from '@tanstack/vue-query'

export const install: UserModule = ({ app }) => {
  app.use(VueQueryPlugin, { enableDevtoolsV6Plugin: true })
}
