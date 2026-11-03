// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu({
  unocss: true,
  formatters: true,
  ignores: [
    'src/auto-imports.d.ts',
    'src/components.d.ts',
    'src/route-map.d.ts',
    'src/typed-router.d.ts',
  ],
})
